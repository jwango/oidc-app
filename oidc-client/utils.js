export function renderStateDetails(value, label, renderFn = renderJson) {
    return (
      <details>
        <summary>{label}</summary>
        <section style={ { "maxHeight": "200px", "overflow": "auto" } }>{renderFn(value)}</section>
      </details>
    )
  }
  
export function renderState(value, label) {
    return <div><label>{label}:</label> {renderJson(value, false)}</div>
}
  
export function renderJson(data, formatted = true) {
    return <pre>{JSON.stringify(data, null, formatted ? 2 : null)}</pre>
}
  