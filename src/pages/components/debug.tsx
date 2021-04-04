import React,{ useEffect, useState } from 'react';
import { Table, Drawer, Button } from 'antd';
import moment from 'moment';

interface IProps {
  children?: any;
}

interface IResources {
  title: string;
  list: {
    name: string;
    time: number;
  }[];
}

interface IPage {
  title: string;
  list: {
    name: string;
    initiatorType: string;
    link: string;
  }[];
}

const Debug = ({ children }: IProps) => {
  const [ajax, setAjax] = useState({} as any);
  const [resources, setResources] = useState<IResources>();
  const [pages, setPages] = useState<IPage>();
  const [visabled, setVisabled] = useState(false);
  const [show, setShow] = useState(false);
  useEffect(() => {
    /**
     * 重写 XMLHttpRequest与fetch 做http 拦截统计接口耗时
     * 为什么要区分 fetch 与 XMLHttpRequest与fetch
     *    XMLHttpRequest与fetch是基于 open()和send()方法实现请求。
     *
     *    fetch 基于promise做了一层分装，
     *    fetch()请求后返回的响应是一个stream对象，
     *    只有在then函数中才可以判断该请求是否执行完毕。
     */

    // 重写 XMLHttpRequest
    (function (open, send) {
      let minT = performance.now(); // XMLHttpRequest耗时监听
      let arr: any[] = [];
      let i = 0;
      let len = arguments.length;
      XMLHttpRequest.prototype.open = function () {
        let st = performance.now();
        let args = [] as any;

        for (let key = 0; key < len; key++) {
          args[key] = arguments[key];
        }

        arr[i] = {
          name: args[1],
          type: 'ajax',
          startTime: 0,
          duration: 0,
          state1: st,
        };

        return open.apply(this, args);
      };

      XMLHttpRequest.prototype.send = function () {
        let _this = this;
        let len1 = arguments.length;
        let args1 = [] as any;
        arr[i].startTime = Date.now(); // 开始时间

        for (let key1 = 0; key1 < len1; key1++) {
          args1[key1] = arguments[key1];
        }
        arr[i].params = args1[0];

        (function (idx) {
          _this.addEventListener('readystatechange', function (res) {
            if (_this.readyState === 2) {
              // 已经接收响应
              arr[idx].state2 = performance.now();
            } else if (_this.readyState === 3) {
              // 解析
              arr[idx].state3 = performance.now();
            } else if (_this.readyState === 4) {
              // 完成
              arr[idx].state4 = performance.now();
              arr[idx].duration = performance.now() - arr[idx].state1;
              setAjax({
                duration: performance.now() - minT, // 接口总耗时
                list: arr,
              });
            }
          });
        })(i);

        i++;
        return send.apply(this, args1);
      };
    })(XMLHttpRequest.prototype.open, XMLHttpRequest.prototype.send); // fetch 耗时监听

    // 重写fetch
    (function () {
      let minT = performance.now(); // XMLHttpRequest耗时监听
      let cusFetch = window.fetch;
      let arr: any[] = [];
      let args = [] as any;
      let i = 0;
      window.fetch = function () {
        const startTime = Date.now(); // 开始时间
        const st = Date.now();
        let len = arguments.length;
        for (let key = 0; key < len; key++) {
          args[key] = arguments[key];
        }

        let newFetch = cusFetch.apply(this, args);

        arr[i] = {
          name: args[0],
          type: 'fetch',
          startTime,
          duration: 0,
          params: args[1]?.body,
        };

        (function (ind) {
          newFetch.then(() => {
            arr[ind].duration = Date.now() - st;
            setAjax({
              duration: performance.now() - minT,
              list: arr,
            });
          });
        })(i);
        i++;
        return newFetch;
      };
    })();
  }, []);

  useEffect(() => {
    const performanceList = performance.getEntries();
    console.log(performanceList, 'l');
    const list1 = performanceList[0] || {};
    const list2: any[] = [];
    performanceList.forEach((item, i) => {
      if (i !== 0) {
        list2.push(item);
      }
    });
    list2.map((it) => {
      const { initiatorType = '', name = '' }: any = it;
      return {
        name,
        type: initiatorType,
      };
    });
    const {
      domainLookupEnd = 0,
      domainLookupStart = 0,
      connectEnd = 0,
      connectStart = 0,
      domComplete = 0,
      domInteractive = 0,
      loadEventEnd = 0,
      navigationStart = 0,
      responseStart = 0,
      domContentLoadedEventEnd = 0,
    }: any = list1;
    const DNS = domainLookupEnd - domainLookupStart;
    const TCP = connectEnd - connectStart;
    const DOM = domComplete - domInteractive;
    const whiteScreen = responseStart - navigationStart;
    const Domready = domContentLoadedEventEnd - navigationStart;
    const Onload = loadEventEnd - navigationStart;
    setResources({
      title: `页面Onload时间${
        DNS + TCP + DOM + whiteScreen + Domready + Onload
      }`,
      list: [
        {
          name: 'DNS解析',
          time: DNS,
        },
        {
          name: 'TCP连接时间',
          time: TCP,
        },
        {
          name: '解析dom树耗时',
          time: DOM,
        },
        {
          name: '白屏时间',
          time: whiteScreen,
        },
        {
          name: 'domready时间',
          time: Domready,
        },
        {
          name: 'onload时间',
          time: Onload,
        },
      ],
    });
    window.addEventListener('keydown', onKeyup);
  }, []);
  function onKeyup(e: any) {
    if (e.shiftKey && e.altKey && e.keyCode === 71) {
      setShow(true);
    }
  }
  return (
    <div>
      {show ? (
        <Button
          onClick={() => setVisabled(true)}
          style={{ position: 'fixed', top: '50%', right: 20 }}
        >
          点击触发
        </Button>
      ) : null}
      <Drawer
        title="性能监测面板"
        placement="right"
        closable={false}
        width="1000"
        onClose={() => {
          setVisabled(false);
        }}
        visible={visabled}
      >
        接口总耗时: {ajax?.duration}
        <Table
          columns={[
            {
              title: '接口名称',
              dataIndex: 'name',
              key: 'name',
            },
            {
              title: '入参',
              dataIndex: 'params',
              key: 'params',
            },
            {
              title: '类型',
              dataIndex: 'type',
              key: 'type',
            },
            {
              title: '接口耗时',
              dataIndex: 'duration',
              key: 'duration',
            },
            {
              title: '开始时间',
              dataIndex: 'startTime',
              key: 'startTime',
              render: (value) => {
                return moment(value).format('YYYY-MM-DD HH:mm:ss');
              },
            },
          ]}
          dataSource={ajax?.list}
        />
        <div>{resources?.title}</div>
        <Table
          columns={[
            {
              title: '名称',
              dataIndex: 'name',
              key: 'name',
            },
            {
              title: '耗时',
              dataIndex: 'time',
              key: 'time',
            },
          ]}
          dataSource={resources?.list}
        />
      </Drawer>
    </div>
  );
};
export default Debug;
