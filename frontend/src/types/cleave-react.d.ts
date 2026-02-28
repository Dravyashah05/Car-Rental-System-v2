declare module 'cleave.js/react' {
  import type { ChangeEvent, ComponentType, InputHTMLAttributes } from 'react';

  type CleaveProps = InputHTMLAttributes<HTMLInputElement> & {
    options?: Record<string, unknown>;
    onChange?: (event: ChangeEvent<HTMLInputElement> & { target: { rawValue?: string; value: string } }) => void;
  };

  const Cleave: ComponentType<CleaveProps>;
  export default Cleave;
}
