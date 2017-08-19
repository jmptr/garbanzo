import * as React from 'react';

export interface ISpanProps {
  children: React.ReactNode[];
}

const Span = (props: ISpanProps) => {
  return (
    <span>
      {...props.children}
    </span>
  );
};

export default Span;
