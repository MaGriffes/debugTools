import React, { useEffect } from 'react';
import api from '@/servers/index';
// import {get,get1,post1} from '@/servers/index';

export default function Home() {
  useEffect(() => {
    api.get({ id: 2222 });
    api.get1({ id: 1111 });
    api.post1({ list: [{ name: '11111' }] });
    // get()
    // get1()
    // post1()
  }, []);

  return <div>请示用组合键 shift+alt+g打开按钮</div>;
}
