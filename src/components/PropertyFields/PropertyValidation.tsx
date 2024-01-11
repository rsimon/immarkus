import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface PropertyValidationContextValue {

  showErrors: boolean;

  setValidationStates: React.Dispatch<React.SetStateAction<{
    [id: string]: boolean;
  }>>

}

const PropertyValidationContext = createContext<PropertyValidationContextValue>(undefined);

interface PropertyValidationProps {

  showErrors: boolean;

  onChange(valid: boolean): void;

  children: ReactNode;

}

export const PropertyValidation = (props: PropertyValidationProps) => {

  const { showErrors } = props;

  const [validationStates, setValidationStates] = useState<{ [id: string]: boolean }>({});

  const [totalState, setTotalState] = useState(false);

  useEffect(() => {
    const isValid = Object.values(validationStates).every(Boolean);
    setTotalState(isValid);
  }, [validationStates]);

  useEffect(() => props.onChange(totalState), [totalState]);

  return (
    <PropertyValidationContext.Provider value={{ setValidationStates, showErrors }}>
      {props.children}
    </PropertyValidationContext.Provider>
  )

}

export const useAbstractValidation = () => {
  const { showErrors, setValidationStates } = useContext(PropertyValidationContext);

  const [isValid, _setIsValid] = useState(false);

  const id = useMemo(() => uuidv4(), []);

  const setIsValid = useCallback((isValid: boolean) => {
    _setIsValid(isValid); // For convenience
    setValidationStates(s => ({...s, [id]: isValid }));
  }, [id]);

  useEffect(() => {
    setValidationStates(s => ({...s, [id]: false }))
  }, [id]);

  return { showErrors, isValid, setIsValid };
} 

type ValidationFunction<T extends any[]> = (...args: T) => boolean;

export const useValidation = <T extends any[]>(
  validationFunction: ValidationFunction<T>,
  args: T
) => {
  const { showErrors, isValid, setIsValid } = useAbstractValidation();

  useEffect(() => setIsValid(validationFunction(...args)), [...args]);

  return { showErrors, isValid };
}

