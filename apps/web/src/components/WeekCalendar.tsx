import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { BarChart2, ChevronLeft, ChevronRight, LineChart, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend);

/* ─── Constants ─────────────────────────────────────────────── */
const HOURS      = Array.from({ length: 17 }, (_, i) => i + 6);
const DAY_SHORT  = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
const DAY_LONG   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MONTHS     = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const HOUR_PX    = 60;
const GRID_START = 6 * 60;
const GRID_END   = 22 * 60;
const GRID_TOTAL = GRID_END - GRID_START;
const SNAP       = 15;

/* ─── Types ──────────────────────────────────────────────────── */
export type EventStatus =
  | 'pending' | 'request_sent' | 'in_review' | 'confirmed' | 'accepted'
  | 'offer_accepted' | 'completed' | 'date_confirmed' | 'deposit_paid'
  | 'final_payment_pending' | 'cancelled' | 'sent_to_client' | 'offer_sent'
  | 'available' | 'reserved';

export interface CalendarEvent {
  id: string;
  title: string;
  subtitle?: string;
  date: Date | string;
  hour?: number | null;
  startMinutes?: number | null;
  endMinutes?: number | null;
  status?: EventStatus | string;
  locked?: boolean;
}

interface NormEvent extends CalendarEvent { _date: Date; }

export type CalendarView = 'day' | 'week' | 'month' | 'agenda' | 'stats';

export interface GridClickPayload  { date: Date; startMinutes: number; endMinutes: number; }
export interface EventMovePayload  { date: Date; startMinutes?: number | null; endMinutes?: number | null; }
export interface SchedulePayload   { date: Date; startMinutes: number; endMinutes: number; title: string; subtitle: string; status: string; }
export interface ReschedulePayload { date: Date; startMinutes: number | null; endMinutes: number | null; title: string; subtitle: string; status: string; }

export interface WeekCalendarProps {
  events?:       CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  editable?:     boolean;
  onGridClick?:  (payload: GridClickPayload) => void;
  onEventMove?:  (event: CalendarEvent, target: EventMovePayload) => void;
  onSchedule?:   (payload: SchedulePayload) => void;
  onReschedule?: (event: CalendarEvent, payload: ReschedulePayload) => void;
  onDelete?:     (event: CalendarEvent) => void;
  focusDate?:    Date | string | null;
}

/* ─── Status colours ─────────────────────────────────────────── */
const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  pending:               { bg:'#fef3c7', border:'#f59e0b', text:'#92400e' },
  request_sent:          { bg:'#fef3c7', border:'#f59e0b', text:'#92400e' },
  in_review:             { bg:'#ffedd5', border:'#fb923c', text:'#9a3412' },
  confirmed:             { bg:'#dcfce7', border:'#22c55e', text:'#166534' },
  accepted:              { bg:'#dcfce7', border:'#22c55e', text:'#166534' },
  offer_accepted:        { bg:'#d1fae5', border:'#10b981', text:'#064e3b' },
  completed:             { bg:'#dbeafe', border:'#3b82f6', text:'#1e3a8a' },
  date_confirmed:        { bg:'#dbeafe', border:'#3b82f6', text:'#1e3a8a' },
  deposit_paid:          { bg:'#e0f2fe', border:'#0ea5e9', text:'#0c4a6e' },
  final_payment_pending: { bg:'#ede9fe', border:'#8b5cf6', text:'#4c1d95' },
  cancelled:             { bg:'#fee2e2', border:'#ef4444', text:'#991b1b' },
  sent_to_client:        { bg:'#f3e8ff', border:'#a855f7', text:'#581c87' },
  offer_sent:            { bg:'#f3e8ff', border:'#a855f7', text:'#581c87' },
  available:             { bg:'#f8edc7', border:'#d8b85d', text:'#604618' },
  reserved:              { bg:'#fde68a', border:'#f59e0b', text:'#92400e' },
};
const DEFAULT_COLOR = { bg:'#f1f5f9', border:'#94a3b8', text:'#475569' };
const STATUS_LABELS: Record<string, string> = {
  pending:'En attente', request_sent:'Demande envoyée', in_review:'En révision',
  confirmed:'Confirmé', accepted:'Accepté', offer_accepted:'Offre acceptée',
  completed:'Terminé', date_confirmed:'Date confirmée', deposit_paid:'Acompte payé',
  final_payment_pending:'Paiement final', cancelled:'Annulé',
  sent_to_client:'Envoyé au client', offer_sent:'Offre envoyée',
  available:'Disponible', reserved:'Réservé',
};
function colorOf(evt: { status?: string }) { return STATUS_COLORS[evt.status ?? ''] ?? DEFAULT_COLOR; }

/* ─── Drag state (module-level) ──────────────────────────────── */
interface DragState { evt: NormEvent; offsetMinutes: number; durationMinutes: number; isAllDay: boolean; }
let _drag: DragState | null = null;

/* ─── Helpers ────────────────────────────────────────────────── */
function startOfWeek(d: Date): Date { const r=new Date(d),day=r.getDay(); r.setDate(r.getDate()+(day===0?-6:1-day)); r.setHours(0,0,0,0); return r; }
function addDays(d: Date, n: number): Date { const r=new Date(d); r.setDate(r.getDate()+n); return r; }
function addMonths(d: Date, n: number): Date { const r=new Date(d); r.setMonth(r.getMonth()+n); return r; }
function isSameDay(a: Date, b: Date) { return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate(); }
function isSameMonth(a: Date, b: Date) { return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth(); }
function fmtHour(h: number) { return `${String(h).padStart(2,'0')}:00`; }
function fmtMin(m: number) { const h=Math.floor(m/60),min=m%60; return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`; }
function fmtDateInput(d: Date) { return d.toISOString().slice(0,10); }
function fmtTimeInput(m: number) { return fmtMin(m); }
function parseTimeInput(s: string): number { const [h,m]=(s||'').split(':').map(Number); return (h||0)*60+(m||0); }

function eventStartMinutes(e: CalendarEvent): number | null {
  if (Number.isFinite(Number(e.startMinutes))) return Number(e.startMinutes);
  if (e.hour != null) return Number(e.hour)*60;
  return null;
}
function eventEndMinutes(e: CalendarEvent): number | null {
  if (Number.isFinite(Number(e.endMinutes))) return Number(e.endMinutes);
  const s=eventStartMinutes(e); return s===null?null:s+60;
}
function snapMin(m: number) { return Math.round(m/SNAP)*SNAP; }
function clampStart(m: number) { return Math.max(GRID_START,Math.min(GRID_END-SNAP,m)); }
function norm(e: CalendarEvent): NormEvent { const d=e.date instanceof Date?e.date:new Date(e.date); return {...e,_date:d}; }
function buildMonthGrid(ref: Date): Date[] {
  const y=ref.getFullYear(),mo=ref.getMonth(),first=new Date(y,mo,1),last=new Date(y,mo+1,0);
  const pad=(first.getDay()+6)%7,cells:Date[]=[];
  for(let i=0;i<pad;i++) cells.push(addDays(first,-pad+i));
  for(let d=1;d<=last.getDate();d++) cells.push(new Date(y,mo,d));
  while(cells.length%7!==0) cells.push(addDays(cells[cells.length-1],1));
  return cells;
}
function formatTitle(view: CalendarView, cur: Date, weekDays: Date[]): string {
  if (view==='day') return `${DAY_LONG[cur.getDay()]} ${cur.getDate()} ${MONTHS[cur.getMonth()]} ${cur.getFullYear()}`;
  if (view==='week') {
    const f=weekDays[0],l=weekDays[6];
    return f.getMonth()===l.getMonth()
      ? `${f.getDate()}–${l.getDate()} ${MONTHS[f.getMonth()]} ${f.getFullYear()}`
      : `${f.getDate()} ${MONTHS[f.getMonth()]} – ${l.getDate()} ${MONTHS[l.getMonth()]} ${l.getFullYear()}`;
  }
  if (view==='month') return `${MONTHS[cur.getMonth()]} ${cur.getFullYear()}`;
  if (view==='stats') return `Statistiques · ${MONTHS[cur.getMonth()]} ${cur.getFullYear()}`;
  return 'Agenda';
}

/* ─── Primitives ─────────────────────────────────────────────── */
function Btn({children,onClick,danger}:{children:React.ReactNode;onClick:()=>void;danger?:boolean}) {
  const [hover,setHover]=useState(false);
  const bg=danger?(hover?'#fef2f2':'#fff'):hover?'#f9fafb':'#fff';
  const col=danger?'#dc2626':'#374151';
  return (
    <button onClick={onClick} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{padding:'4px 12px',borderRadius:8,border:`1px solid ${danger?'#fca5a5':'#e5e7eb'}`,background:bg,fontSize:'0.72rem',fontWeight:600,color:col,cursor:'pointer',transition:'background .12s'}}>
      {children}
    </button>
  );
}
function IconBtn({children,onClick}:{children:React.ReactNode;onClick:()=>void}) {
  return (
    <button onClick={onClick}
      style={{width:28,height:28,borderRadius:8,border:'1px solid #e5e7eb',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#374151'}}
      onMouseEnter={e=>{e.currentTarget.style.background='#f9fafb';}}
      onMouseLeave={e=>{e.currentTarget.style.background='#fff';}}>
      {children}
    </button>
  );
}

/* ─── Shared input style ─────────────────────────────────────── */
const INPUT: React.CSSProperties = {
  width:'100%',padding:'7px 10px',borderRadius:8,border:'1px solid #e5e7eb',
  fontSize:'0.8rem',outline:'none',boxSizing:'border-box',
  background:'#fff',color:'#111827',
};
const LABEL: React.CSSProperties = { display:'block',fontSize:'0.68rem',fontWeight:700,color:'#374151',marginBottom:3 };

/* ─── Schedule / Reschedule modal ────────────────────────────── */
interface FormState {
  mode: 'create' | 'edit';
  eventRef?: NormEvent;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  subtitle: string;
  status: string;
}

function EventModal({
  form, onChange, onSave, onDelete: onDel, onClose,
}: {
  form: FormState;
  onChange: (f: FormState) => void;
  onSave: () => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const set = (k: keyof FormState, v: string) => onChange({ ...form, [k]: v });
  return (
    <div
      onClick={onClose}
      style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(7,27,58,0.35)',backdropFilter:'blur(2px)',display:'flex',alignItems:'center',justifyContent:'center'}}
    >
      <div
        onClick={e=>e.stopPropagation()}
        style={{background:'#fff',borderRadius:16,boxShadow:'0 24px 80px rgba(7,27,58,0.22)',width:380,maxWidth:'95vw',overflow:'hidden'}}
      >
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',borderBottom:'1px solid #f1f5f9',background:form.mode==='create'?'#f0f9ff':'#fff8f0'}}>
          <span style={{fontSize:'0.85rem',fontWeight:700,color:'#0a0a5c'}}>
            {form.mode==='create' ? '📅 Planifier un créneau' : '✏️ Modifier le créneau'}
          </span>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'#9ca3af',display:'flex'}}>
            <X size={17}/>
          </button>
        </div>

        {/* Body */}
        <div style={{padding:'16px 18px',display:'flex',flexDirection:'column',gap:12}}>
          <div>
            <label style={LABEL}>Titre *</label>
            <input style={INPUT} placeholder="Nom du créneau…" value={form.title} onChange={e=>set('title',e.target.value)} autoFocus/>
          </div>
          <div>
            <label style={LABEL}>Sous-titre</label>
            <input style={INPUT} placeholder="Description optionnelle…" value={form.subtitle} onChange={e=>set('subtitle',e.target.value)}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr',gap:10}}>
            <div>
              <label style={LABEL}>Date</label>
              <input style={INPUT} type="date" value={form.date} onChange={e=>set('date',e.target.value)}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <div>
                <label style={LABEL}>Début</label>
                <input style={INPUT} type="time" value={form.startTime} onChange={e=>set('startTime',e.target.value)}/>
              </div>
              <div>
                <label style={LABEL}>Fin</label>
                <input style={INPUT} type="time" value={form.endTime} onChange={e=>set('endTime',e.target.value)}/>
              </div>
            </div>
          </div>
          <div>
            <label style={LABEL}>Statut</label>
            <select
              style={{...INPUT,appearance:'auto'}}
              value={form.status}
              onChange={e=>set('status',e.target.value)}
            >
              {Object.entries(STATUS_LABELS).map(([k,v])=>(
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 18px',borderTop:'1px solid #f1f5f9',gap:8}}>
          <div>
            {form.mode==='edit'&&onDel&&(
              <button onClick={onDel}
                style={{display:'flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:8,border:'1px solid #fca5a5',background:'#fff',color:'#dc2626',fontSize:'0.72rem',fontWeight:700,cursor:'pointer'}}
                onMouseEnter={e=>{e.currentTarget.style.background='#fef2f2';}}
                onMouseLeave={e=>{e.currentTarget.style.background='#fff';}}>
                <Trash2 size={13}/> Supprimer
              </button>
            )}
          </div>
          <div style={{display:'flex',gap:8}}>
            <Btn onClick={onClose}>Annuler</Btn>
            <button
              onClick={onSave}
              disabled={!form.title.trim()}
              style={{padding:'6px 18px',borderRadius:8,border:'none',background:form.title.trim()?'#007fff':'#93c5fd',color:'#fff',fontSize:'0.72rem',fontWeight:700,cursor:form.title.trim()?'pointer':'not-allowed',transition:'background .12s'}}
            >
              {form.mode==='create'?'Planifier':'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Main component
   ════════════════════════════════════════════════════════════════ */
export default function WeekCalendar({
  events = [],
  onEventClick,
  editable = false,
  onGridClick,
  onEventMove,
  onSchedule,
  onReschedule,
  onDelete,
  focusDate = null,
}: WeekCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView]               = useState<CalendarView>('week');
  const [now, setNow]                 = useState(new Date());
  const [statsType, setStatsType]     = useState<'line' | 'bar'>('bar');
  const scrollRef = useRef<HTMLDivElement>(null);

  /* drag-drop */
  const [dropPreview, setDropPreview] = useState<{ dayKey: string; startMinutes: number; durationMinutes: number; isAllDay: boolean }|null>(null);
  const [draggingId, setDraggingId]   = useState<string|null>(null);

  /* schedule/reschedule modal */
  const [modal, setModal] = useState<FormState|null>(null);

  useEffect(()=>{
    if(!focusDate) return;
    const d=focusDate instanceof Date?focusDate:new Date(focusDate);
    if(Number.isNaN(d.getTime())) return;
    setCurrentDate(new Date(d.getFullYear(),d.getMonth(),d.getDate()));
    setView(v=>v==='agenda'?'week':v);
  },[focusDate]);

  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),60_000); return ()=>clearInterval(t); },[]);

  useEffect(()=>{
    if((view==='week'||view==='day')&&scrollRef.current)
      scrollRef.current.scrollTop=Math.max(0,(now.getHours()-7)*HOUR_PX-80);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[view]);

  const today    = useMemo(()=>new Date(),[]);
  const allNorm  = useMemo(()=>events.map(norm),[events]);
  const timed    = useMemo(()=>allNorm.filter(e=>eventStartMinutes(e)!==null),[allNorm]);
  const allDay   = useMemo(()=>allNorm.filter(e=>eventStartMinutes(e)===null),[allNorm]);
  const weekDays = useMemo(()=>Array.from({length:7},(_,i)=>addDays(startOfWeek(currentDate),i)),[currentDate]);

  const nowMin    = now.getHours()*60+now.getMinutes();
  const nowOffset = ((nowMin-GRID_START)/GRID_TOTAL)*(HOURS.length*HOUR_PX);
  const showNow   = nowMin>=GRID_START&&nowMin<=GRID_END;

  /* Navigation */
  const goPrev=()=>{ if(view==='day')setCurrentDate(d=>addDays(d,-1)); if(view==='week')setCurrentDate(d=>addDays(d,-7)); if(view==='month'||view==='stats')setCurrentDate(d=>addMonths(d,-1)); if(view==='agenda')setCurrentDate(d=>addMonths(d,-1)); };
  const goNext=()=>{ if(view==='day')setCurrentDate(d=>addDays(d,1));  if(view==='week')setCurrentDate(d=>addDays(d,7));  if(view==='month'||view==='stats')setCurrentDate(d=>addMonths(d,1));  if(view==='agenda')setCurrentDate(d=>addMonths(d,1));  };
  const goToday=()=>setCurrentDate(new Date());

  /* ── Modal helpers ── */
  function openCreate(date: Date, startMinutes: number) {
    setModal({
      mode:'create', date:fmtDateInput(date),
      startTime:fmtTimeInput(startMinutes),
      endTime:fmtTimeInput(Math.min(GRID_END, startMinutes+60)),
      title:'', subtitle:'', status:'pending',
    });
  }
  function openEdit(evt: NormEvent) {
    const sm=eventStartMinutes(evt)??GRID_START;
    const em=eventEndMinutes(evt)??sm+60;
    setModal({
      mode:'edit', eventRef:evt,
      date:fmtDateInput(evt._date),
      startTime:fmtTimeInput(sm),
      endTime:fmtTimeInput(em),
      title:evt.title,
      subtitle:evt.subtitle??'',
      status:evt.status??'pending',
    });
  }
  function submitModal() {
    if(!modal||!modal.title.trim()) return;
    const date=new Date(modal.date);
    const sm=parseTimeInput(modal.startTime);
    const em=parseTimeInput(modal.endTime);
    if(modal.mode==='create') {
      onSchedule?.({ date, startMinutes:sm, endMinutes:em, title:modal.title.trim(), subtitle:modal.subtitle.trim(), status:modal.status });
      onGridClick?.({ date, startMinutes:sm, endMinutes:em });
    } else if(modal.eventRef) {
      onReschedule?.(modal.eventRef, { date, startMinutes:sm, endMinutes:em, title:modal.title.trim(), subtitle:modal.subtitle.trim(), status:modal.status });
    }
    setModal(null);
  }
  function deleteFromModal() {
    if(modal?.eventRef) { onDelete?.(modal.eventRef); setModal(null); }
  }

  /* ── Drag ── */
  function startDrag(e: React.DragEvent, evt: NormEvent) {
    if(evt.locked||!onEventMove) return;
    const rect=e.currentTarget.getBoundingClientRect();
    const sm=eventStartMinutes(evt);
    const em=eventEndMinutes(evt);
    const isAllDay=sm===null;
    _drag={ evt, offsetMinutes:isAllDay?0:Math.round(((e.clientY-rect.top)/HOUR_PX)*60), durationMinutes:isAllDay?60:(em??(sm??0)+60)-(sm??0), isAllDay };
    setDraggingId(evt.id);
    const ghost=document.createElement('div');
    ghost.style.cssText='position:fixed;top:-9999px;opacity:0;width:1px;height:1px;';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost,0,0);
    requestAnimationFrame(()=>document.body.removeChild(ghost));
    e.dataTransfer.effectAllowed='move';
  }
  function endDrag() { _drag=null; setDraggingId(null); setDropPreview(null); }

  const computeStartMin=useCallback((clientY:number,el:Element,drag:DragState)=>{
    const rect=el.getBoundingClientRect();
    return clampStart(snapMin(GRID_START+((clientY-rect.top)/(HOURS.length*HOUR_PX))*GRID_TOTAL-drag.offsetMinutes));
  },[]);

  function onColDragOver(e:React.DragEvent,day:Date){ if(!_drag||_drag.isAllDay)return; e.preventDefault(); e.dataTransfer.dropEffect='move'; const sm=computeStartMin(e.clientY,e.currentTarget,_drag); setDropPreview({dayKey:day.toDateString(),startMinutes:sm,durationMinutes:_drag.durationMinutes,isAllDay:false}); }
  function onColDrop(e:React.DragEvent,day:Date){ if(!_drag||_drag.isAllDay)return; e.preventDefault(); const sm=computeStartMin(e.clientY,e.currentTarget,_drag); onEventMove?.(_drag.evt,{date:day,startMinutes:sm,endMinutes:sm+_drag.durationMinutes}); endDrag(); }
  function onAllDayOver(e:React.DragEvent,day:Date){ if(!_drag)return; e.preventDefault(); e.dataTransfer.dropEffect='move'; setDropPreview({dayKey:day.toDateString(),startMinutes:0,durationMinutes:0,isAllDay:true}); }
  function onAllDayDrop(e:React.DragEvent,day:Date){ if(!_drag)return; e.preventDefault(); onEventMove?.(_drag.evt,{date:day,startMinutes:null,endMinutes:null}); endDrag(); }
  function onCellOver(e:React.DragEvent,day:Date){ if(!_drag)return; e.preventDefault(); e.dataTransfer.dropEffect='move'; setDropPreview({dayKey:day.toDateString(),startMinutes:0,durationMinutes:0,isAllDay:true}); }
  function onCellDrop(e:React.DragEvent,day:Date){ if(!_drag)return; e.preventDefault(); const sm=_drag.isAllDay?null:eventStartMinutes(_drag.evt); const em=_drag.isAllDay?null:eventEndMinutes(_drag.evt); onEventMove?.(_drag.evt,{date:day,startMinutes:sm,endMinutes:em}); endDrag(); }

  function handleGridClick(day:Date,e:React.MouseEvent<HTMLButtonElement>){
    const rect=e.currentTarget.getBoundingClientRect();
    const raw=GRID_START+((e.clientY-rect.top)/(HOURS.length*HOUR_PX))*GRID_TOTAL;
    const sm=clampStart(snapMin(raw));
    if(onSchedule) { openCreate(day,sm); return; }
    onGridClick?.({date:day,startMinutes:sm,endMinutes:sm+60});
  }
  function handleEventClick(evt:NormEvent){ if(evt.locked)return; if(onReschedule){openEdit(evt);return;} onEventClick?.(evt); }

  /* ── Stats data ── */
  const statsWeekLabels = weekDays.map(d=>`${DAY_SHORT[d.getDay()]} ${d.getDate()}`);
  const statsWeekCounts = weekDays.map(day=>allNorm.filter(e=>isSameDay(e._date,day)).length);

  const statsMonthCells = useMemo(()=>buildMonthGrid(currentDate),[currentDate]);
  const statsMonthLabels = statsMonthCells.filter((_,i)=>i%1===0).map(d=>`${d.getDate()}`);
  const statsMonthCounts = statsMonthCells.map(day=>allNorm.filter(e=>isSameDay(e._date,day)).length);

  const byStatus = useMemo(()=>{
    const acc: Record<string,number>={};
    allNorm.forEach(e=>{ const s=e.status??'unknown'; acc[s]=(acc[s]??0)+1; });
    return Object.entries(acc).filter(([,c])=>c>0).sort((a,b)=>b[1]-a[1]);
  },[allNorm]);

  const CHART_OPTS = {
    responsive:true, maintainAspectRatio:false,
    interaction:{intersect:false,mode:'index' as const},
    plugins:{
      legend:{position:'bottom' as const,labels:{boxWidth:10,boxHeight:10,color:'#071b3a',font:{size:12,weight:700 as const},padding:16,usePointStyle:true}},
      tooltip:{backgroundColor:'rgba(7,27,58,0.92)',bodyFont:{size:13,weight:700 as const},borderColor:'rgba(255,255,255,0.16)',borderWidth:1,cornerRadius:14,padding:12,titleFont:{size:13,weight:800 as const}},
    },
    scales:{
      x:{border:{display:false},grid:{display:false},ticks:{color:'rgba(7,27,58,0.55)',font:{size:11,weight:700 as const}}},
      y:{border:{display:false},grid:{color:'rgba(0,127,255,0.08)'},ticks:{color:'rgba(7,27,58,0.48)',font:{size:11,weight:700 as const},stepSize:1},beginAtZero:true},
    },
  };

  /* ── Sub-views ── */
  function TimeGrid({days}:{days:Date[]}) {
    return (
      <div ref={scrollRef} style={{overflowY:'auto',maxHeight:520}}>
        <div style={{display:'grid',gridTemplateColumns:`52px repeat(${days.length},1fr)`,position:'relative'}}>
          <div>
            {HOURS.map(h=>(
              <div key={h} style={{height:HOUR_PX,position:'relative'}}>
                <span style={{position:'absolute',top:-8,right:8,fontSize:'0.63rem',color:'#9ca3af',userSelect:'none',whiteSpace:'nowrap'}}>{fmtHour(h)}</span>
              </div>
            ))}
          </div>
          {days.map((day,di)=>{
            const isToday=isSameDay(day,today);
            const dayKey=day.toDateString();
            const dayTimed=timed.filter(e=>isSameDay(e._date,day));
            const preview=dropPreview?.dayKey===dayKey&&!dropPreview.isAllDay?dropPreview:null;
            return (
              <div key={di} onDragOver={e=>onColDragOver(e,day)} onDrop={e=>onColDrop(e,day)} onDragLeave={()=>{if(dropPreview?.dayKey===dayKey)setDropPreview(null);}}
                style={{position:'relative',borderLeft:'1px solid #f1f5f9',background:isToday?'#eff6ff28':'transparent'}}>
                {editable&&(
                  <button type="button" aria-label="Ajouter un créneau" onClick={e=>handleGridClick(day,e)}
                    style={{position:'absolute',inset:0,zIndex:1,cursor:'crosshair',background:'transparent',border:'none',padding:0,pointerEvents:draggingId?'none':'auto'}}/>
                )}
                {HOURS.map(h=><div key={h} style={{height:HOUR_PX,borderTop:'1px solid #f1f5f9'}}/>)}
                {HOURS.map(h=><div key={`hh${h}`} style={{position:'absolute',left:0,right:0,top:(h-6)*HOUR_PX+HOUR_PX/2,borderTop:'1px dashed #f8fafc',pointerEvents:'none'}}/>)}
                {isToday&&showNow&&(
                  <div style={{position:'absolute',left:0,right:0,top:nowOffset,zIndex:20,display:'flex',alignItems:'center',pointerEvents:'none'}}>
                    <div style={{width:10,height:10,borderRadius:'50%',background:'#ef4444',marginLeft:-5,flexShrink:0}}/>
                    <div style={{flex:1,height:2,background:'#ef4444'}}/>
                  </div>
                )}
                {preview&&_drag&&(
                  <div style={{position:'absolute',left:3,right:3,top:((preview.startMinutes-GRID_START)/GRID_TOTAL)*(HOURS.length*HOUR_PX)+1,height:Math.max(34,(preview.durationMinutes/60)*HOUR_PX-2),background:colorOf(_drag.evt).bg,border:`2px dashed ${colorOf(_drag.evt).border}`,borderRadius:6,zIndex:30,pointerEvents:'none',opacity:.75,display:'flex',alignItems:'center',paddingLeft:6}}>
                    <span style={{fontSize:'0.63rem',fontWeight:700,color:colorOf(_drag.evt).text,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
                      {fmtMin(preview.startMinutes)} – {fmtMin(preview.startMinutes+preview.durationMinutes)}
                    </span>
                  </div>
                )}
                {dayTimed.map(evt=>{
                  const c=colorOf(evt);
                  const sm=Math.max(GRID_START,eventStartMinutes(evt)??GRID_START);
                  const em=Math.min(GRID_END,eventEndMinutes(evt)??GRID_END);
                  const top=((sm-GRID_START)/GRID_TOTAL)*(HOURS.length*HOUR_PX);
                  const height=Math.max(34,((Math.max(em,sm+30)-sm)/60)*HOUR_PX-2);
                  const locked=Boolean(evt.locked);
                  const isDrag=draggingId===evt.id;
                  return (
                    <div key={evt.id} draggable={!locked&&!!onEventMove} onDragStart={e=>startDrag(e,evt)} onDragEnd={endDrag}
                      onClick={e=>{e.stopPropagation();handleEventClick(evt);}}
                      style={{position:'absolute',left:3,right:3,top:top+1,minHeight:34,height,background:c.bg,borderLeft:`3px solid ${c.border}`,borderRadius:6,padding:'4px 7px',cursor:locked?'not-allowed':onEventMove?'grab':'pointer',zIndex:10,boxShadow:'0 1px 3px rgba(0,0,0,0.07)',transition:'opacity .15s',opacity:isDrag?.35:1,userSelect:'none'}}
                      onMouseEnter={e=>{if(!locked&&!isDrag)e.currentTarget.style.opacity='.8';}}
                      onMouseLeave={e=>{if(!isDrag)e.currentTarget.style.opacity=locked?'0.92':'1';}}>
                      <p style={{margin:0,fontSize:'0.69rem',fontWeight:700,color:c.text,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{evt.title}</p>
                      {evt.subtitle&&<p style={{margin:'1px 0 0',fontSize:'0.62rem',color:c.text,opacity:.7,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{evt.subtitle}</p>}
                      <p style={{margin:'2px 0 0',fontSize:'0.6rem',color:c.text,opacity:.55}}>
                        {fmtMin(eventStartMinutes(evt)??0)}{eventEndMinutes(evt)!==null?` – ${fmtMin(eventEndMinutes(evt)??0)}`:''}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function AllDayRow({days}:{days:Date[]}) {
    const hasAny=days.some(d=>allDay.some(e=>isSameDay(e._date,d)));
    if(!hasAny&&!draggingId) return null;
    return (
      <div style={{display:'grid',gridTemplateColumns:`52px repeat(${days.length},1fr)`,borderBottom:'1px solid #f1f5f9',minHeight:36}}>
        <div style={{fontSize:'0.6rem',color:'#9ca3af',textAlign:'right',paddingRight:6,paddingTop:4,fontWeight:600}}>Journée</div>
        {days.map((day,di)=>{
          const dayEvts=allDay.filter(e=>isSameDay(e._date,day));
          const dayKey=day.toDateString();
          const isTarget=dropPreview?.dayKey===dayKey&&dropPreview.isAllDay;
          return (
            <div key={di} onDragOver={e=>onAllDayOver(e,day)} onDrop={e=>onAllDayDrop(e,day)} onDragLeave={()=>{if(dropPreview?.dayKey===dayKey)setDropPreview(null);}}
              style={{borderLeft:'1px solid #f1f5f9',padding:'2px',background:isTarget?'#eff6ff':'transparent',transition:'background .15s'}}>
              {dayEvts.map(evt=>{
                const c=colorOf(evt);
                const locked=Boolean(evt.locked);
                const isDrag=draggingId===evt.id;
                return (
                  <div key={evt.id} draggable={!locked&&!!onEventMove} onDragStart={e=>startDrag(e,evt)} onDragEnd={endDrag}
                    onClick={()=>handleEventClick(evt)}
                    style={{background:c.bg,borderLeft:`3px solid ${c.border}`,color:c.text,fontSize:'0.63rem',fontWeight:600,padding:'2px 5px',borderRadius:4,cursor:locked?'not-allowed':onEventMove?'grab':'pointer',marginBottom:2,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',opacity:isDrag?.35:1,userSelect:'none'}}>
                    {evt.title}
                  </div>
                );
              })}
              {isTarget&&_drag&&(
                <div style={{background:colorOf(_drag.evt).bg,border:`2px dashed ${colorOf(_drag.evt).border}`,borderRadius:4,padding:'2px 5px',fontSize:'0.63rem',fontWeight:600,color:colorOf(_drag.evt).text,opacity:.75,pointerEvents:'none',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
                  {_drag.evt.title}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  /* ════ RENDER ════ */
  return (
    <>
      <div onDragEnd={endDrag}
        style={{display:'flex',flexDirection:'column',background:'#fff',borderRadius:16,border:'1px solid #f1f5f9',boxShadow:'0 1px 4px rgba(0,0,0,0.06)',overflow:'hidden',fontFamily:'inherit'}}>

        {/* ── Toolbar ── */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:'1px solid #f1f5f9',gap:8,flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            <Btn onClick={goToday}>Aujourd'hui</Btn>
            <IconBtn onClick={goPrev}><ChevronLeft size={15}/></IconBtn>
            <IconBtn onClick={goNext}><ChevronRight size={15}/></IconBtn>
          </div>
          <span style={{fontSize:'0.875rem',fontWeight:700,color:'#0a0a5c',letterSpacing:'-0.01em',textAlign:'center',flex:1}}>
            {formatTitle(view,currentDate,weekDays)}
          </span>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            {/* View switcher */}
            <div style={{display:'flex',background:'#f1f5f9',borderRadius:8,padding:2,gap:1}}>
              {(['day','week','month','agenda','stats'] as const).map(v=>(
                <button key={v} onClick={()=>setView(v)}
                  style={{padding:'4px 10px',borderRadius:6,border:'none',fontSize:'0.69rem',fontWeight:600,cursor:'pointer',transition:'all .15s',background:view===v?'#fff':'transparent',color:view===v?'#0a0a5c':'#6b7280',boxShadow:view===v?'0 1px 3px rgba(0,0,0,0.1)':'none'}}>
                  {v==='day'?'Jour':v==='week'?'Semaine':v==='month'?'Mois':v==='agenda'?'Agenda':'Stats'}
                </button>
              ))}
            </div>
            {/* Schedule button */}
            {(editable||onSchedule)&&(
              <button
                onClick={()=>openCreate(today,9*60)}
                style={{padding:'5px 13px',borderRadius:8,border:'none',background:'#007fff',color:'#fff',fontSize:'0.72rem',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}
                onMouseEnter={e=>{e.currentTarget.style.background='#005fcc';}}
                onMouseLeave={e=>{e.currentTarget.style.background='#007fff';}}>
                + Planifier
              </button>
            )}
          </div>
        </div>

        {/* ══ DAY VIEW ══ */}
        {view==='day'&&(
          <>
            <div style={{display:'grid',gridTemplateColumns:'52px 1fr',borderBottom:'1px solid #f1f5f9'}}>
              <div/>
              <div style={{textAlign:'center',padding:'8px 4px',borderLeft:'1px solid #f1f5f9'}}>
                <div style={{fontSize:'0.65rem',fontWeight:600,color:isSameDay(currentDate,today)?'#3b82f6':'#9ca3af',textTransform:'uppercase',letterSpacing:'0.06em'}}>{DAY_SHORT[currentDate.getDay()]}</div>
                <div style={{margin:'3px auto 0',width:30,height:30,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',background:isSameDay(currentDate,today)?'#3b82f6':'transparent',color:isSameDay(currentDate,today)?'#fff':'#111827',fontSize:'0.85rem',fontWeight:isSameDay(currentDate,today)?700:500}}>
                  {currentDate.getDate()}
                </div>
              </div>
            </div>
            <AllDayRow days={[currentDate]}/>
            <TimeGrid days={[currentDate]}/>
          </>
        )}

        {/* ══ WEEK VIEW ══ */}
        {view==='week'&&(
          <>
            <div style={{display:'grid',gridTemplateColumns:'52px repeat(7,1fr)',borderBottom:'1px solid #f1f5f9'}}>
              <div style={{padding:'8px 0',textAlign:'center'}}><span style={{fontSize:'0.55rem',color:'#d1d5db'}}>GMT+1</span></div>
              {weekDays.map((day,i)=>{
                const isToday=isSameDay(day,today);
                return (
                  <div key={i} style={{textAlign:'center',padding:'8px 4px',borderLeft:'1px solid #f1f5f9'}}>
                    <div style={{fontSize:'0.65rem',fontWeight:600,color:isToday?'#3b82f6':'#9ca3af',textTransform:'uppercase',letterSpacing:'0.06em'}}>{DAY_SHORT[day.getDay()]}</div>
                    <div style={{margin:'3px auto 0',width:30,height:30,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',background:isToday?'#3b82f6':'transparent',color:isToday?'#fff':'#111827',fontSize:'0.85rem',fontWeight:isToday?700:500}}>
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
            <AllDayRow days={weekDays}/>
            <TimeGrid days={weekDays}/>
          </>
        )}

        {/* ══ MONTH VIEW ══ */}
        {view==='month'&&(()=>{
          const cells=buildMonthGrid(currentDate);
          const weeks:Date[][]=[];
          for(let i=0;i<cells.length;i+=7) weeks.push(cells.slice(i,i+7));
          return (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:'1px solid #f1f5f9'}}>
                {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d=>(
                  <div key={d} style={{textAlign:'center',padding:'8px 4px',fontSize:'0.65rem',fontWeight:600,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.06em'}}>{d}</div>
                ))}
              </div>
              {weeks.map((week,wi)=>(
                <div key={wi} style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
                  {week.map((day,di)=>{
                    const isToday=isSameDay(day,today);
                    const inMonth=isSameMonth(day,currentDate);
                    const dayKey=day.toDateString();
                    const dayEvts=allNorm.filter(e=>isSameDay(e._date,day));
                    const isTarget=dropPreview?.dayKey===dayKey;
                    const maxShow=3;
                    const overflow=dayEvts.length-maxShow;
                    return (
                      <div key={di} onDragOver={e=>onCellOver(e,day)} onDrop={e=>onCellDrop(e,day)} onDragLeave={()=>{if(dropPreview?.dayKey===dayKey)setDropPreview(null);}}
                        style={{minHeight:96,borderLeft:di>0?'1px solid #f1f5f9':'none',borderTop:'1px solid #f1f5f9',padding:'4px',background:isTarget?'#eff6ff':isToday?'#eff6ff28':inMonth?'#fff':'#fafafa',transition:'background .15s'}}>
                        <div style={{display:'flex',justifyContent:'flex-end',marginBottom:3}}>
                          <span style={{width:24,height:24,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.72rem',fontWeight:isToday?700:500,background:isToday?'#3b82f6':'transparent',color:isToday?'#fff':inMonth?'#111827':'#d1d5db'}}>
                            {day.getDate()}
                          </span>
                        </div>
                        {dayEvts.slice(0,maxShow).map(evt=>{
                          const c=colorOf(evt);
                          const sm=eventStartMinutes(evt);
                          const locked=Boolean(evt.locked);
                          const isDrag=draggingId===evt.id;
                          return (
                            <div key={evt.id} draggable={!locked&&!!onEventMove} onDragStart={e=>startDrag(e,evt)} onDragEnd={endDrag}
                              onClick={()=>handleEventClick(evt)}
                              style={{background:c.bg,borderLeft:`2px solid ${c.border}`,color:c.text,fontSize:'0.6rem',fontWeight:600,padding:'1px 4px',borderRadius:3,marginBottom:2,cursor:locked?'not-allowed':onEventMove?'grab':'pointer',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',opacity:isDrag?.35:1,userSelect:'none'}}>
                              {sm!==null&&<span style={{opacity:.65,marginRight:3}}>{fmtMin(sm)}</span>}
                              {evt.title}
                            </div>
                          );
                        })}
                        {overflow>0&&<div style={{fontSize:'0.58rem',color:'#6b7280',fontWeight:600,paddingLeft:2}}>+{overflow} autre{overflow>1?'s':''}</div>}
                        {isTarget&&_drag&&(
                          <div style={{background:colorOf(_drag.evt).bg,border:`2px dashed ${colorOf(_drag.evt).border}`,borderRadius:3,padding:'1px 4px',fontSize:'0.6rem',fontWeight:600,color:colorOf(_drag.evt).text,opacity:.75,pointerEvents:'none',marginTop:2,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
                            {_drag.evt.title}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })()}

        {/* ══ AGENDA VIEW ══ */}
        {view==='agenda'&&(()=>{
          const sorted=[...allNorm].sort((a,b)=>a._date.getTime()-b._date.getTime());
          if(sorted.length===0) return <div style={{padding:'48px 0',textAlign:'center',color:'#9ca3af',fontSize:'0.875rem'}}>Aucun événement planifié</div>;
          const groups:{key:string;date:Date;events:NormEvent[]}[]=[];
          sorted.forEach(evt=>{ const key=evt._date.toDateString(); const last=groups[groups.length-1]; if(last&&last.key===key)last.events.push(evt); else groups.push({key,date:evt._date,events:[evt]}); });
          return (
            <div style={{overflowY:'auto',maxHeight:560}}>
              {groups.map(group=>{
                const isToday=isSameDay(group.date,today);
                return (
                  <div key={group.key}>
                    <div style={{display:'flex',alignItems:'baseline',gap:8,padding:'10px 16px 6px',background:'#f9fafb',borderBottom:'1px solid #f1f5f9',position:'sticky',top:0,zIndex:5}}>
                      <span style={{fontSize:'1.25rem',fontWeight:700,color:isToday?'#3b82f6':'#111827',lineHeight:1}}>{group.date.getDate()}</span>
                      <span style={{fontSize:'0.7rem',fontWeight:600,color:isToday?'#3b82f6':'#6b7280',textTransform:'uppercase',letterSpacing:'0.07em'}}>{DAY_SHORT[group.date.getDay()]} · {MONTHS[group.date.getMonth()]} {group.date.getFullYear()}</span>
                      {isToday&&<span style={{fontSize:'0.58rem',fontWeight:700,color:'#fff',background:'#3b82f6',borderRadius:4,padding:'1px 6px'}}>Aujourd'hui</span>}
                    </div>
                    <div style={{padding:'0 16px'}}>
                      {group.events.map(evt=>{
                        const c=colorOf(evt);
                        const sm=eventStartMinutes(evt);
                        const locked=Boolean(evt.locked);
                        const isDrag=draggingId===evt.id;
                        return (
                          <div key={evt.id} draggable={!locked&&!!onEventMove} onDragStart={e=>startDrag(e,evt)} onDragEnd={endDrag}
                            onClick={()=>handleEventClick(evt)}
                            style={{display:'flex',alignItems:'flex-start',gap:12,padding:'10px 0',borderBottom:'1px solid #f1f5f9',cursor:locked?'not-allowed':onEventMove?'grab':'pointer',borderRadius:6,opacity:isDrag?.35:1,userSelect:'none'}}
                            onMouseEnter={e=>{e.currentTarget.style.background='#f9fafb';}}
                            onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}>
                            <div style={{minWidth:40,fontSize:'0.72rem',fontWeight:600,color:'#6b7280',paddingTop:2}}>{sm!==null?fmtMin(sm):'—'}</div>
                            <div style={{width:4,minHeight:36,borderRadius:2,background:c.border,flexShrink:0,marginTop:2}}/>
                            <div style={{flex:1,minWidth:0}}>
                              <p style={{margin:0,fontSize:'0.82rem',fontWeight:600,color:'#111827',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{evt.title}</p>
                              {evt.subtitle&&<p style={{margin:'2px 0 0',fontSize:'0.72rem',color:'#6b7280',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{evt.subtitle}</p>}
                            </div>
                            <div style={{flexShrink:0,fontSize:'0.6rem',fontWeight:700,padding:'2px 8px',borderRadius:999,background:c.bg,color:c.text,border:`1px solid ${c.border}`,whiteSpace:'nowrap'}}>
                              {(evt.status??'').replace(/_/g,' ')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* ══ STATS VIEW ══ */}
        {view==='stats'&&(
          <div style={{padding:'20px 20px 28px',display:'flex',flexDirection:'column',gap:24}}>
            {/* Toggle line/bar */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <p style={{margin:0,fontSize:'0.72rem',fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.08em'}}>
                Événements cette semaine · {allNorm.length} au total
              </p>
              <div style={{display:'flex',background:'#f1f5f9',borderRadius:8,padding:2,gap:1}}>
                <button onClick={()=>setStatsType('bar')}
                  style={{padding:'4px 10px',borderRadius:6,border:'none',fontSize:'0.69rem',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:4,transition:'all .15s',background:statsType==='bar'?'#fff':'transparent',color:statsType==='bar'?'#0a0a5c':'#6b7280',boxShadow:statsType==='bar'?'0 1px 3px rgba(0,0,0,0.1)':'none'}}>
                  <BarChart2 size={13}/> Barres
                </button>
                <button onClick={()=>setStatsType('line')}
                  style={{padding:'4px 10px',borderRadius:6,border:'none',fontSize:'0.69rem',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:4,transition:'all .15s',background:statsType==='line'?'#fff':'transparent',color:statsType==='line'?'#0a0a5c':'#6b7280',boxShadow:statsType==='line'?'0 1px 3px rgba(0,0,0,0.1)':'none'}}>
                  <LineChart size={13}/> Ligne
                </button>
              </div>
            </div>

            {/* Weekly distribution chart */}
            <div>
              <p style={{margin:'0 0 10px',fontSize:'0.75rem',fontWeight:700,color:'#374151'}}>Distribution hebdomadaire</p>
              <div style={{height:200}}>
                {statsType==='bar'?(
                  <Bar
                    data={{labels:statsWeekLabels,datasets:[{label:'Événements',data:statsWeekCounts,backgroundColor:'rgba(0,127,255,0.72)',borderRadius:8,borderSkipped:false,maxBarThickness:36}]}}
                    options={CHART_OPTS}
                  />
                ):(
                  <Line
                    data={{labels:statsWeekLabels,datasets:[{label:'Événements',data:statsWeekCounts,borderColor:'#007fff',backgroundColor:'rgba(0,127,255,0.12)',borderWidth:3,fill:true,tension:.4,pointRadius:5,pointHoverRadius:7,pointBackgroundColor:'#f7d618',pointBorderColor:'#007fff',pointBorderWidth:2}]}}
                    options={CHART_OPTS}
                  />
                )}
              </div>
            </div>

            {/* Monthly coverage */}
            <div>
              <p style={{margin:'0 0 10px',fontSize:'0.75rem',fontWeight:700,color:'#374151'}}>Couverture mensuelle</p>
              <div style={{height:180}}>
                {statsType==='bar'?(
                  <Bar
                    data={{labels:statsMonthLabels,datasets:[{label:'Événements / jour',data:statsMonthCounts,backgroundColor:'rgba(16,185,129,0.65)',borderRadius:4,borderSkipped:false,maxBarThickness:14}]}}
                    options={CHART_OPTS}
                  />
                ):(
                  <Line
                    data={{labels:statsMonthLabels,datasets:[{label:'Événements / jour',data:statsMonthCounts,borderColor:'#10b981',backgroundColor:'rgba(16,185,129,0.10)',borderWidth:2.5,fill:true,tension:.35,pointRadius:3,pointHoverRadius:6,pointBackgroundColor:'#10b981'}]}}
                    options={CHART_OPTS}
                  />
                )}
              </div>
            </div>

            {/* By status */}
            {byStatus.length>0&&(
              <div>
                <p style={{margin:'0 0 10px',fontSize:'0.75rem',fontWeight:700,color:'#374151'}}>Par statut</p>
                <div style={{height:180}}>
                  <Bar
                    data={{
                      labels:byStatus.map(([s])=>STATUS_LABELS[s]??s),
                      datasets:[{
                        label:'Événements',
                        data:byStatus.map(([,c])=>c),
                        backgroundColor:byStatus.map(([s])=>STATUS_COLORS[s]?.border??'#94a3b8'),
                        borderRadius:6,borderSkipped:false,maxBarThickness:32,
                      }],
                    }}
                    options={{...CHART_OPTS,indexAxis:'y' as const,scales:{
                      x:{...CHART_OPTS.scales.x,ticks:{...CHART_OPTS.scales.x.ticks,stepSize:1}},
                      y:{border:{display:false},grid:{display:false},ticks:{color:'rgba(7,27,58,0.55)',font:{size:11,weight:700}}},
                    }}}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Schedule / Reschedule Modal ── */}
      {modal&&(
        <EventModal
          form={modal}
          onChange={setModal}
          onSave={submitModal}
          onDelete={modal.mode==='edit'&&onDelete?deleteFromModal:undefined}
          onClose={()=>setModal(null)}
        />
      )}
    </>
  );
}
