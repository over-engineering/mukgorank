const _ = require('lodash');

const initialData = [
  [4, 3, 0, 4],
  [3, 0 ,3, 4],
  [0, 4, 0, 3],
  [2, 2, 4, 1],
];

const dampRatio = process.env.DAMP || 0.75;
const cUser = (1 - dampRatio) / initialData.length;
const cMenu = (1 - dampRatio) / initialData[0].length;

const makeUserMatrix = (data, mRank) => {
  const res = _.map(data, (user, uid) => {
    let vector = [];
    _.each(data, (other, i) => {
      if (uid === i) {
        vector.push(0);
      } else {
        let totalDiff = 0;
        _.each(other, (menu, mid) => {
          if (menu !== 0 && user[mid] !== 0) {
            let diff = user[mid] - menu;
            if (diff > 0) {
              totalDiff += diff * mRank[mid];
            }
          }
        })
        vector.push(totalDiff);
      }
    })
    return vector;
  })
  return normalize(res);
} 

const makeMenuMatrix = (data, uRank) => {
  let res = [];
  for (let i = 0; i < data[0].length; i++) {
    let vector = [];
    for (let j = 0; j < data[0].length; j++) {
      if (i === j) {
        vector.push(0)
        continue
      }
      let totalDiff = 0;
      _.each(data, (user, uid) => {
        if (user[i] !== 0 && user[j] !== 0) {
          let diff = user[j] - user[i]
          if (diff > 0) {
            totalDiff += diff * uRank[uid];
          }
        }
      })
      vector.push(totalDiff);
    }
    res.push(vector);
  }
  return normalize(res)
}

function normalize(array) {
  const sum = _.map(array, (val) => {
    return _.reduce(val, (prev, curr) => {
      return curr += prev
    }, 0)
  })
  return _.map(array, (val, i) => _.map(val, v => v / sum[i]))
}

let userRank = new Array(initialData.length);
userRank.fill(1/initialData.length);

let menuRank = new Array(initialData[0].length);
menuRank.fill(1/initialData[0].length);

let lUser = makeUserMatrix(initialData, menuRank);
let lMenu = makeMenuMatrix(initialData, userRank);

console.log(lUser, lMenu);

for(let i = 0; i < 20; i ++) {
  userRank = _.map(userRank, (user, uid) => {
    let val = 0;
    _.each(lUser, (c, i) => {
      if (uid !== i) {
        val += c[uid] * userRank[i]
      }
    })
    return cUser + dampRatio * val;
  })

  menuRank = _.map(menuRank, (menu, mid) => {
    let val = 0;
    _.each(lMenu, (c, i) => {
      if (mid !== i) {
        val += c[mid] * menuRank[i]
      }
    })
    return cMenu + dampRatio * val;
  })

  lUser = makeUserMatrix(initialData, menuRank);
  lMenu = makeMenuMatrix(initialData, userRank);
}

console.log(lUser, lMenu);

console.log(userRank)
console.log(menuRank);
