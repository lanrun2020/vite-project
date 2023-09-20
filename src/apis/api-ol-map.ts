import axios from 'axios'
export const getLayerList = async () => {
  const {data} =  await axios.get(`../src/json/ol-data/pipeProperty.json`)
  return data
};


export const getmetaData = async () => {
  const {data} =  await axios.get(`../src/json/ol-data/pipeData.json`)
  return data
}