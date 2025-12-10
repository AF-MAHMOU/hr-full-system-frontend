import { ShiftType } from "../types";
import s from "../page.module.css";

interface ShiftTypeListProps {
  shifttypes: ShiftType[];
  onDelete: (id: string) => void;
}

export default function ShiftTypeList({ shifttypes, onDelete }: ShiftTypeListProps) {
  if (!shifttypes.length) return <p>No shift Types found</p>;

  /*
  export interface ShiftType {
  id: string;
  name: string;
  active: boolean;
}
  */
  return (
    <div className={s.shifttypeContainer}>
      {shifttypes.map((shifttype) => (
        <div key={shifttype.id} className={s.Card}>
          <h4 className={s.header}>{shifttype.name}</h4>
        
          <p className={s.description}>
            Type: {shifttype.name} 
          </p>

          <p className={s.description}>
            Active? {shifttype.active} 
          </p>
          
          <button className={s.button} onClick={() => onDelete(shifttype.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
