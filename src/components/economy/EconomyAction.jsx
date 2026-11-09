import {useState} from 'react';
import {actionPreview} from '../../utils/economyActions';
const titles={availability:'Suspendre ou rouvrir',fund:'Alimenter la caisse',stock:'Ajuster le stock',schedule:'Programmer un barème',review:'Signaler pour vérification',resolve:'Rapprocher la remise',compensations:'Proposer une compensation',materials:'Vérifier les récompenses', 'complete-transfer':'Terminer le virement'};
export default function EconomyAction({action,subject,api,onDone}){
  const [fields,setFields]=useState({reason:'',amount:'',stock:'',tax:'0',treasury:'',version:'',date:'',decision:''}),[preview,setPreview]=useState(null),[checked,setChecked]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[unknown,setUnknown]=useState(false),[done,setDone]=useState('');
  const change=(field,value)=>{setFields(old=>({...old,[field]:value}));setPreview(null);setError('');setDone('');};
  const prepare=event=>{event.preventDefault();try{setPreview({...actionPreview(action,subject,fields),key:crypto.randomUUID()});setChecked(false);setError('');}catch(failure){setError(failure.message);}};
  const submit=async()=>{
    if(busy||!preview||(preview.physical&&!checked))return;setBusy(true);setError('');
    try{await api.post(preview.path,preview.body,preview.key);setUnknown(false);setPreview(null);setDone('Demande confirmée. Le registre a été actualisé.');onDone();}
    catch(failure){setUnknown(Boolean(failure.retryable));setError(failure.message);if(!failure.retryable){setPreview(null);onDone();}}
    finally{setBusy(false);}
  };
  const input=(key,label,props={})=><label>{label}<input value={fields[key]} onChange={event=>change(key,event.target.value)} {...props}/></label>;
  return <details className="economy-action-form"><summary>{titles[action]}</summary><form onSubmit={prepare}>
    <fieldset disabled={busy||unknown}>
      {action==='fund'&&input('amount','Montant en fer',{inputMode:'numeric',maxLength:19,placeholder:'Ex. 4096',required:true})}
      {action==='stock'&&<><p>Offre : {subject.offer?.offer_id}</p>{input('stock','Nouveau disponible',{inputMode:'numeric',maxLength:10,required:true})}</>}
      {action==='schedule'&&<>{input('version','Nom de la nouvelle version',{maxLength:160,required:true,placeholder:'Ex. pilote-circos-01'})}{input('tax','Taxe (%)',{inputMode:'decimal',required:true})}{input('treasury','Caisse fiscale (si taxe)',{placeholder:'cashbox:city:…',maxLength:200})}{input('date','Publier à partir du',{type:'datetime-local',required:true})}<p className="economy-muted">La date utilise votre fuseau horaire. Un changement de barème avant cette date bloque la publication automatique pour vérification.</p></>}
      {['resolve','materials'].includes(action)&&<label>Décision<select required value={fields.decision} onChange={event=>change('decision',event.target.value)}><option value="">Choisir une décision</option>{action==='resolve'?<><option value="delivery">La remise a déjà été effectuée</option><option value="cancel">La remise n’a pas été effectuée</option></>:<><option value="DELIVERED">Objets et XP déjà remis</option><option value="RETRY">Autoriser une nouvelle remise</option></>}</select></label>}
      {action!=='complete-transfer'&&<label>Motif ou preuve de vérification<textarea required maxLength={160} rows={3} value={fields.reason} onChange={event=>change('reason',event.target.value)} placeholder="Décrivez ce qui justifie cette action."/></label>}
      {!preview&&<button className="realm-action" type="submit">Voir l’aperçu</button>}
    </fieldset>
    {preview&&<div className="economy-preview"><p className="economy-eyebrow">AVANT DE VALIDER</p><dl className="economy-details">{preview.changes.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      {preview.physical&&<label className="economy-check"><input type="checkbox" checked={checked} onChange={event=>setChecked(event.target.checked)} disabled={busy||unknown}/>J’ai vérifié les objets, les pièces et, pour une récompense, l’XP. Cette action ne doit pas provoquer une seconde remise.</label>}
      <div className="economy-actions"><button className="realm-action economy-primary" type="button" disabled={busy||(preview.physical&&!checked)} onClick={submit}>{busy?'Enregistrement…':unknown?'Reprendre la même demande':'Confirmer cette action'}</button>{!unknown&&<button className="realm-action" type="button" disabled={busy} onClick={()=>setPreview(null)}>Modifier</button>}</div>
    </div>}
    {error&&<p className="economy-error" role="alert">{error}{unknown&&' Le résultat est incertain. Reprenez cette demande ; gardez la même référence.'}</p>}
    {done&&<p className="economy-success" role="status">{done}</p>}
  </form></details>;
}
