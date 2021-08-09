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
  
export  function getQueryParams(url) {
  const queryParams = (url.split("?")[1] || "").split("#")[0].split("&").reduce((acc, val) => {
      const mapping = val.split("=");
      if (mapping.length == 2) { acc[mapping[0]] = mapping[1]; }
      return acc;
  }, {});
  return queryParams;
}

export function setQueryParams(url, paramsMap) {
  const baseUrl = url.split("?")[0];
  const queriesUri = Object.keys(paramsMap).reduce((acc, queryKey) => {
      if (!paramsMap[queryKey]) { return acc; }
      return [...acc, queryKey + "=" + paramsMap[queryKey]];
  }, []);
  if (queriesUri.length > 0) { return baseUrl + "?" + queriesUri.join("&"); }
  return baseUrl;
}

export function handleFetchResponse(res, useJson = true) {
  if (res.ok) {
      if (useJson) {
          return res.json();
      } else {
          return res.text();
      }
  } else {
      throw { status: res.status, statusText: res.statusText, body: res.text() };
  }
}