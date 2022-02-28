import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

import {
  Button,
  CircularProgress,
  CircularProgressLabel,
  Divider,
  FormControl,
  FormLabel,
  SimpleGrid,
  Switch,
} from "@chakra-ui/react";

import { AiFillAlert } from "react-icons/ai";
import { MdLightbulb } from "react-icons/md";
import { GiElectric } from "react-icons/gi";
import { BsFillChatDotsFill } from "react-icons/bs";

import "./HomePage.css";
const HomePage = () => {
  const room = "q";
  const username = "admin";
  const [data, setData] = useState();
  const [stompClient, setStompClient] = useState(null);
  const [potValue, setPotValue] = useState(0);
  const [leds, setLeds] = useState({ led1: false, led2: false });

  const onBuzzerClick = (led) => {
    sendMessage("buzzer on", "USER");
    setTimeout(() => {
      sendMessage("buzzer off", "USER");
    }, 500);
  };

  useEffect(() => {
    if (stompClient !== undefined && stompClient !== null) {
      const { led1, led2 } = leds;
      sendMessage(led1 === true ? "led1 off" : "led1 on", "USER"); // for relay but same logic
      sendMessage(led2 != true ? "led2 off" : "led2 on", "USER"); // for led
    }
  }, [leds]);

  useEffect(() => {
    const sock = new SockJS("http://192.168.0.17:8080/chat");
    const client = Stomp.over(sock);
    setStompClient(client);
  }, []);

  useEffect(() => {
    if (stompClient !== undefined && stompClient !== null) {
      stompClient.connect({}, onConnected, onError);
    }
  }, [stompClient]);

  const onConnected = () => {
    if (stompClient !== undefined && stompClient !== null) {
      sendMessage(username + " connected", "SYSTEM");
      stompClient.subscribe("/topic/messages/" + room, onMessageReceived);
    }
  };

  const onMessageReceived = (payload) => {
    const message = JSON.parse(payload.body);
    if (message?.messageType === "INPUT") {
      setPotValue(message?.message);
    } else {
      setData(message);
    }

    // setTimeout(() => {
    //
    // }, 500);
  };

  const onError = (error) => {
    console.log(error);
  };

  const sendMessage = async (msg, type) => {
    if (msg !== "") {
      const data = {
        message: msg,
        username: username,
        messageType: type && type ? type : "USER",
        created: new Date(),
      };
      if (stompClient) {
        console.log("message sending.....");
        stompClient.send("/app/chat/" + room, {}, JSON.stringify(data));
      }
    }
  };

  return (
    <div
      className="home-page-row"
      style={{
        margin: 250,
      }}
    >
      <div>
        {data?.username === "admin" ? (
          ""
        ) : (
          <div>
            <div className="home-page-row">
              <BsFillChatDotsFill size={20} />
              <h1 className="home-page-message">{data?.message}</h1>
            </div>
            <Divider />
          </div>
        )}
        <div className="home-page-row">
          <GiElectric size={25} />
          <h1 className="home-page-label" htmlFor="isChecked">
            Relay
          </h1>
          <Switch
            id="isChecked"
            value={leds.led1}
            onChange={() => setLeds({ ...leds, led1: !leds.led1 })}
            size="lg"
          />
        </div>
        <div className="home-page-row">
          <MdLightbulb size={25} />
          <h1 className="home-page-label" htmlFor="isChecked2">
            Led
          </h1>
          <Switch
            value={leds.led2}
            onChange={() => setLeds({ ...leds, led2: !leds.led2 })}
            id="isChecked2"
            size="lg"
          />
        </div>
        <div className="home-page-row">
          <Button
            onClick={onBuzzerClick}
            leftIcon={<AiFillAlert />}
            size="lg"
            colorScheme="blue"
          >
            Buzzer
          </Button>
        </div>

        <div className="home-page-row">
          <CircularProgress value={potValue} size="150px" color="green.400">
            <CircularProgressLabel>
              <h1> {potValue}%</h1>
            </CircularProgressLabel>
          </CircularProgress>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
