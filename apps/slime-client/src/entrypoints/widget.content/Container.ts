import { createContext, useContext } from 'react';

export const ContainerContext = createContext<HTMLElement>(document.body);