import React, { createContext, useState } from 'react';

export const ContaContext = createContext();

export function ContaProvider({ children }) {
  const [contaConectada, setContaConectada] = useState('');

  return (
    <ContaContext.Provider value={{ contaConectada, setContaConectada }}>
      {children}
    </ContaContext.Provider>
  );
}