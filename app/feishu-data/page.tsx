'use client';
import { useEffect, useState } from "react";


export default function Page() {
  const [data, setData] = useState([])
  const fetchData = async () => {
    const response = await fetch(`/apis/get-feishu-data`);
    const data = await response.json();
    setData(data)
    return data;
  };
  useEffect(() => {
    fetchData();
  }
  , []);
  return <div>{data?.map((item: any) => {
    return (<div>
      <p style={{backgroundColor: item?.backgroundColor}}>{item?.title}</p>
    </div>)
  })}</div>
}