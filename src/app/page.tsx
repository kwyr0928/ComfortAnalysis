"use client";

import axios, { type AxiosResponse } from "axios";
import {
  Droplet,
  Frown,
  Leaf,
  LoaderCircle,
  Smile,
  Snowflake,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Slider } from "~/components/ui/slider";
import { type Data, columns } from "./columns";
import { DataTable } from "./data-table";

type UdpData = {
  // センサデータの型定義
  temperature: number;
  humidity: number;
  co2: number;
};

export default function Page() {
  const [udpData, setUdpData] = useState<UdpData>({
    temperature: 0,
    humidity: 0,
    co2: 0,
  }); // センサデータ
  const [slider1, setSlider1] = useState<number>(0); // temperature
  const [slider2, setSlider2] = useState<number>(0); // humidity
  const [slider3, setSlider3] = useState<number>(0); // co2
  const [lastTime2, setLastTime2] = useState<number>(0); // humidity
  const [lastTime3, setLastTime3] = useState<number>(0); // co2
  const [data, setData] = useState<Data[]>([]); // テーブルデータ
  const [loading, setLoading] = useState<boolean>(true);
  const [loading2, setLoading2] = useState<boolean>(true);
  const [humidityAlert, setHumidityAlert] = useState(40); // 湿度アラート
  const [co2Alert, setCo2Alert] = useState(800); // CO2アラート

  useEffect(() => {
    if (loading2) return;
    // センサデータ取得
    const fetchData = async () => {
      try {
        const response: AxiosResponse<UdpData> = await axios.get(
          "http://192.168.10.101:1880/data",
        ); // Node-REDのURL
        const data = response.data;
        setUdpData(data); // センサデータ更新
        setSlider1(data.temperature - 10); // temperature
        setSlider2(data.humidity); // humidity
        setSlider3(data.co2); // co2
        console.log("UDP data:", data);
        if (data.humidity < humidityAlert) {
          // 湿度が規定値を下回ったらLINEメッセージ送信
          const now = Date.now();
          if (!lastTime2 || now - lastTime2 >= 30 * 60 * 1000) {
            // 前回の送信から30分経過しているか
            void sendMessage(
              `湿度が${humidityAlert}%を下回っています！加湿器を付けてください！`,
            );
            setLastTime2(Date.now()); // 送信時間更新
            setData((prevData) => [
              // テーブルデータ更新
              ...prevData,
              {
                id: prevData.length + 1,
                date: new Date().toLocaleTimeString("ja-JP", {
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                kinds: "湿度",
                title: "湿度低下",
              },
            ]);
          }
        }
        if (data.co2 > co2Alert) {
          // CO2濃度が規定値を超えたらLINEメッセージ送信
          const now = Date.now();
          if (!lastTime3 || now - lastTime3 >= 30 * 60 * 1000) {
            // 前回の送信から30分経過しているか
            void sendMessage(
              `CO2濃度が${co2Alert}ppmを超えました！換気してください！`,
            );
            setLastTime3(Date.now()); // 送信時間更新
            setData((prevData) => [
              // テーブルデータ更新
              ...prevData,
              {
                id: prevData.length + 1,
                date: new Date().toLocaleTimeString("ja-JP", {
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                kinds: "CO2",
                title: "CO2濃度上昇",
              },
            ]);
          }
        }
      } catch (error) {
        console.error(axios.isAxiosError(error) ? error.message : error);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
    const interval = setInterval(() => {
      fetchData().catch(console.error);
    }, 5000); // 5秒ごとにセンサデータ取得
    return () => clearInterval(interval);
  }, [co2Alert, humidityAlert, lastTime2, lastTime3, loading2]);

  const sendMessage = async (message: string) => {
    // LINEメッセージ送信
    try {
      const userId = `${process.env.NEXT_PUBLIC_USER_ID}`; // LINEユーザID
      await axios.post('/api/line', {
        userId: userId,
        message: message
      });
      console.log("Message sent:", message);
    } catch (error) {
      console.error(axios.isAxiosError(error) ? error.message : error);
    }
  };
  
  useEffect(() => { // ローカルストレージからデータ取得
    const savedData = localStorage.getItem('tableData');
    const savedLastTime2 = localStorage.getItem('lastTime2');
    const savedLastTime3 = localStorage.getItem('lastTime3');
    const savedHumidityAlert = localStorage.getItem('humidityAlert');
    const savedCo2Alert = localStorage.getItem('co2Alert');
    if (savedData) {
      setData(JSON.parse(savedData) as Data[]);
    }
    if (savedLastTime2) {
      setLastTime2(Number(savedLastTime2));
    }
    if (savedLastTime3) {
      setLastTime3(Number(savedLastTime3));
    }
    if (savedHumidityAlert) {
      setHumidityAlert(Number(savedHumidityAlert));
    }
    if (savedCo2Alert) {
      setCo2Alert(Number(savedCo2Alert));
    }
    setLoading2(false);
  }, []);

  useEffect(() => { // テーブルデータ保存
    if (!loading) {
      localStorage.setItem('tableData', JSON.stringify(data));
    }
  }, [data, loading]);
  
  useEffect(() => { // 送信時間保存
    if (!loading) {
      localStorage.setItem('lastTime2', String(lastTime2));
    }
  }, [lastTime2, loading]);
  
  useEffect(() => { // 送信時間保存
    if (!loading) {
      localStorage.setItem('lastTime3', String(lastTime3));
    }
  }, [lastTime3, loading]);

  useEffect(() => { // 湿度アラート保存
    if (!loading) {
      localStorage.setItem('humidityAlert', String(humidityAlert));
    }
  }, [humidityAlert, loading]);

  useEffect(() => { // CO2アラート保存
    if (!loading) {
      localStorage.setItem('co2Alert', String(co2Alert));
    }
  }, [co2Alert, loading]);

  const handleHumidityChange = (value: number) => { // 湿度設定
    setHumidityAlert(value);
  };

  const handleCo2Change = (value: number) => { // CO2設定
    setCo2Alert(value);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center text-center">
      <div className="my-7 text-xl font-medium">
        ENVⅢ × eCO2 室内の快適度分析
      </div>
      <div className="my-5 text-lg font-semibold">現在の室内</div>
      <div className="flex items-center justify-center space-x-3">
        <Snowflake className="text-blue-400" />
        <Slider
          value={[slider1]}
          onValueChange={(value) =>
            value[0] !== undefined && setSlider1(value[0])
          }
          disabled
          max={20}
          step={1}
          className="my-2 w-64 rounded-full bg-gradient-to-r from-blue-500 via-white to-red-500"
        />
        <Sun className="text-red-400" />
      </div>
      <div className="text-md mb-2 text-center">
        温度 :{" "}
        <span className="text-lg font-semibold">
          {Math.round(udpData.temperature)}
        </span>{" "}
        ℃
      </div>
      <div className="flex items-center justify-center space-x-3">
        <Leaf className="text-orange-400" />
        <Slider
          value={[slider2]}
          onValueChange={(value) =>
            value[0] !== undefined && setSlider2(value[0])
          }
          disabled
          max={100}
          step={1}
          className="my-2 w-64 rounded-full bg-gradient-to-r from-orange-500 via-white to-green-500"
        />
        <Droplet className="text-green-400" />
      </div>
      <div className="text-md mb-2 text-center">
      湿度 :{" "}
        <span className="text-lg font-semibold">
          {Math.round(udpData.humidity)}
        </span>{" "}
        %
      </div>
      <div className="flex items-center justify-center space-x-3">
        <Smile className="text-yellow-500" />
        <Slider
          value={[slider3]}
          onValueChange={(value) =>
            value[0] !== undefined && setSlider3(value[0])
          }
          disabled
          max={1200}
          step={1}
          className="my-2 w-64 rounded-full bg-gradient-to-r from-yellow-500 via-white to-purple-500"
        />
        <Frown className="text-purple-400" />
      </div>
      <div className="text-md text-center">
      CO2濃度 :{" "}
        <span className="text-lg font-semibold">{Math.round(udpData.co2)}</span>{" "}
        ppm
      </div>
      <div className="mt-10 mb-4 text-lg font-semibold">通知設定</div>
      <div className="w-[90%] border rounded-lg py-5">
        <div>湿度が
        <Select value={String(humidityAlert)} onValueChange={(value) => handleHumidityChange(Number(value))}>
        <SelectTrigger className="inline-flex w-fit mx-2">
        <SelectValue placeholder="--%　" />
        </SelectTrigger>
          <SelectContent>
          <SelectItem value="50"><span className="font-semibold">50</span> %　</SelectItem>
          <SelectItem value="40"><span className="font-semibold">40</span> %　</SelectItem>
          <SelectItem value="30"><span className="font-semibold">30</span> %　</SelectItem>
          <SelectItem value="20"><span className="font-semibold">20</span> %</SelectItem>
          <SelectItem value="10"><span className="font-semibold">10</span> %　</SelectItem>
          </SelectContent>
        </Select>
        を下回ったら通知</div>
        <div>CO2濃度が
        <Select value={String(co2Alert)} onValueChange={(value) => handleCo2Change(Number(value))}>
        <SelectTrigger className="inline-flex w-fit mx-2">
        <SelectValue placeholder="--ppm　" />
        </SelectTrigger>
          <SelectContent>
          <SelectItem value="500"><span className="font-semibold">500</span> ppm　</SelectItem>
          <SelectItem value="600"><span className="font-semibold">600</span> ppm　</SelectItem>
          <SelectItem value="700"><span className="font-semibold">700</span> ppm</SelectItem>
          <SelectItem value="800"><span className="font-semibold">800</span> ppm　</SelectItem>
          <SelectItem value="900"><span className="font-semibold">900</span> ppm　</SelectItem>
          <SelectItem value="1000"><span className="font-semibold">1000</span> ppm　</SelectItem>
          <SelectItem value="1100"><span className="font-semibold">1100</span> ppm　</SelectItem>
          <SelectItem value="1200"><span className="font-semibold">1200</span> ppm　</SelectItem>
          </SelectContent>
        </Select>
        を上回ったら通知</div>
      </div>
      <div className="container my-12 w-[90%]">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
