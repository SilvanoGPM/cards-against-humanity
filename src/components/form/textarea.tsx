import { forwardRef, ForwardRefRenderFunction, ReactNode } from 'react';

import {
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Textarea as RawTextarea,
  TextareaProps as RawTextareaProps,
  Text,
} from '@chakra-ui/react';

export interface InputProps extends RawTextareaProps {
  label?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const TextareaBase: ForwardRefRenderFunction<
  HTMLTextAreaElement,
  InputProps
> = (
  { label, placeholder, hint, name, leftIcon, rightIcon, ...props },
  ref
) => {
  return (
    <FormControl>
      {label && (
        <FormLabel htmlFor={name} color="black" fontWeight="bold">
          {label}
        </FormLabel>
      )}

      <InputGroup>
        {leftIcon && <InputLeftElement h="full">{leftIcon}</InputLeftElement>}

        <RawTextarea
          ref={ref}
          name={name}
          id={name}
          borderWidth="1px"
          borderColor="black"
          color="black"
          placeholder={placeholder}
          {...props}
        />

        {rightIcon && <InputRightElement>{rightIcon}</InputRightElement>}
      </InputGroup>

      {hint && (
        <Text fontSize="16px" mb="4" color="gray.600">
          {hint}
        </Text>
      )}
    </FormControl>
  );
};

export const Textarea = forwardRef<HTMLTextAreaElement, InputProps>(
  TextareaBase
);
