import React, { useContext, useState } from 'react';

import Snackbar from '../components/snackbar.component';

function useSnackbarState() {
  const [state, setState] = useState({ visible: false, content: '' });

  const showSnackbar = function(content) {
    setState({ visible: true, content });
  }

  const dismissSnackbar = function(delay) {
    const dismissLater = function() {
      setState((prevState) => ({ ...prevState, visible: false }));
    }
    setTimeout(dismissLater, delay || 0);
  }

  return [state, showSnackbar, dismissSnackbar];
};

const SnackbarContext = React.createContext();

export const SnackbarContextProvider = ({ children }) => {
   const [state, showSnackbar, dismissSnackbar] = useSnackbarState();

   return (
    <SnackbarContext.Provider value={[showSnackbar, dismissSnackbar]}>
      <Snackbar state={state} onDismiss={dismissSnackbar}></Snackbar>
      {children}
    </SnackbarContext.Provider>
   )
}

export function useSnackbar() {
  return useContext(SnackbarContext);
}