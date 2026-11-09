import CharacterPortrait from "./CharacterPortrait";

export function IdentityFields({ fields, setFields, errors, settings, portraitOptions }) {
  const change = event => setFields(old => ({ ...old, [event.target.name]: event.target.value }));
  const labels = { name: "Prénom RP", surname: "Nom RP", origin: "Origine du personnage", description: "Présentation" };
  return <><div className="registration-fields">{["name", "surname", "origin", "description"].map(key =>
    <label className={key === "description" ? "registration-wide" : ""} key={key} htmlFor={`profile-${key}`}>
      <span>{labels[key]} <small>{settings.required_fields.includes(key) ? "Obligatoire" : "Facultatif"}</small></span>
      {key === "description" ? <textarea id={`profile-${key}`} name={key} value={fields[key]} onChange={change} rows="5" maxLength={2000}
        aria-invalid={Boolean(errors[key])} aria-describedby={`hint-${key}`} placeholder="Quelques mots sur votre personnage, ses envies, son histoire…" /> :
        <input id={`profile-${key}`} name={key} value={fields[key]} onChange={change} maxLength={key === "origin" ? 120 : 60}
          autoComplete="off" aria-invalid={Boolean(errors[key])} aria-describedby={`hint-${key}`} />}
      <small id={`hint-${key}`} className={errors[key] ? "registration-error-text" : "registration-muted"}>
        {errors[key] || (key === "origin" ? "Une origine RP, sans attribution automatique de ville ou de maison." : key === "description" ? `${fields.description.length} / 2 000 caractères` : "Votre identité dans le royaume, pas votre identité Google.")}
      </small>
    </label>)}</div>
    <fieldset className="registration-portraits"><legend>Votre portrait</legend><p className="registration-muted">Un choix visuel, modifiable ensuite, sans effet sur vos capacités.</p>
      <div className="registration-portrait-options">{portraitOptions.filter(item => settings.portraits.includes(item.id) || item.id === fields.portrait).map(item =>
        <label key={item.id} className={fields.portrait === item.id ? "is-selected" : ""}>
          <input type="radio" name="portrait" value={item.id} checked={fields.portrait === item.id} onChange={change} />
          <CharacterPortrait portrait={item.id} /><span>{item.label}</span>
        </label>)}</div>{errors.portrait && <p className="registration-error-text" role="alert">{errors.portrait}</p>}
    </fieldset></>;
}

export function CharacterPreview({ fields, minecraft, rank, rankLabel = "Rang actuel" }) {
  return <aside className="registration-preview" aria-label="Aperçu du personnage">
    <p className="realm-eyebrow">Le registre / Votre empreinte</p><CharacterPortrait portrait={fields.portrait} />
    <h2>{fields.name || "Votre prénom"}<br /><em>{fields.surname || "Votre nom"}</em></h2>
    <p className="registration-preview-origin">{fields.origin || "Une histoire à écrire"}</p>
    <p className="registration-biography">{fields.description || "Le premier chapitre vous appartient."}</p>
    <dl><div><dt>Identité Minecraft</dt><dd>{minecraft?.verified ? minecraft.username : "À associer"}</dd></div>
      <div><dt>{rankLabel}</dt><dd>{rank || "Selon le registre"}</dd></div></dl>
  </aside>;
}
