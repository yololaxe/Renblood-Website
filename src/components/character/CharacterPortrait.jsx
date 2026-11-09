export default function CharacterPortrait({ portrait = "wanderer", className = "" }) {
  return <img src={`/portraits/${portrait}.svg`} alt="" className={`character-portrait ${className}`} width="240" height="300" />;
}
