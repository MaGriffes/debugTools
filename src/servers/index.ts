import { generateAPI } from 'cool-utils';
import home from './home';
export default generateAPI(home);

// import request  from 'umi-request';
// const api = '/api';
// function get(){
//   request.get(`${api}/qd/tj?id=1111`)
// }
// function get1(){
//   request.get(`${api}/qd/tj?id2`)
// }
// function post1(){
//   request.post(`${api}/cs/aaa`,{
//     data: {
//       name: "Mike"
//     }
//   })
// }
// export {
//   get,
//   get1,
//   post1
// }
