
import React, { useEffect } from 'react';
interface IProps {
  children: any;
}
export default function Layouts({ children }: IProps) {
  return <div>{children}</div>;
}
