import React from 'react';
import Children from './children';
import DeBug from '@/pages/components/debug';
import api from '@/servers/home';
export default function Home() {
  return (
    <div>
      <Children />
      <DeBug />
    </div>
  );
}
