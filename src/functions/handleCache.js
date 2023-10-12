const { createClient } = require("redis");

const redis = createClient({
  url: process.env.REDIS_CACHE,
});

redis.on("error", (err) => {
  console.log("Redis Caching client error: ", err);
});

redis.on("connect", () => {
  console.log("Redis Caching client connected");
});

redis.connect();


const getCache = async (key) => {
  redis.get(key, (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    if (data) {
      console.log("Cache Hit");
      return data;
    } else {
      console.log("Cache Miss");
      return null;
    }
  });
};

const setCache = async (key, value) => {
  redis.set(key, value, (err) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("Cache Set");
  });
};

const setCacheWithExpire = async (key, value, expire) => {
  redis.set(key, value, "EX", expire, (err) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("Cache Set");
  });
};

const deleteCache = async (key) => {
  redis.del(key, (err) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("Cache Deleted");
  });
};

/**
 * Adds an element to the list or creates a new list if not present
 * @param {List} key 
 * @param {String} value 
 */
const addElementToList = async (key, value) => {
  redis.lPush(key, value, (err) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("Cache Added");
  });
};

const getList = async (key) => {
  redis.lRange(key, 0, -1, (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("Cache Retrieved");
    return data;
  });
};

const deleteList = async (key) => {
  redis.del(key, (err) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("Cache Deleted");
  });
};

/**
 * Checks if the element is present in the list
 * @param {List} key 
 * @param {String} value 
 */
const checkElementInList = async (key, value) => {

  return (await redis.lRange(key,0,-1)).includes(value)
};

module.exports = {
  getCache,
  setCache,
  setCacheWithExpire,
  deleteCache,
  addElementToList,
  getList,
  deleteList,
  checkElementInList,
};
