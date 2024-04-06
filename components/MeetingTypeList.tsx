"use client";
import Image from "next/image";
import React, { useState } from "react";
import HomeCard from "./HomeCard";
import { useRouter } from "next/navigation";
import MeetingModal from "./MeetingModal";
import { useUser } from "@clerk/nextjs";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useToast } from "./ui/use-toast";
import toast from "react-hot-toast";
import { Textarea } from "./ui/textarea";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import { sk } from "date-fns/locale/sk";
import { Input } from "./ui/input";
import { HoverEffect } from "./ui/card-hover-effect";
import { Features } from "@/constats";
registerLocale("sk", sk);

const initialValues = {
  dateTime: new Date(),
  description: "",
  link: "",
};
const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<
    "isScheduleMeeting" | "isJoiningMeeting" | "isInstantMeeting" | undefined
  >(undefined);
  const [values, setValues] = useState(initialValues);
  const [callDetails, setCallDetails] = useState<Call>();
  const client = useStreamVideoClient();
  const { user } = useUser();

  const createMeeting = async () => {
    if (!client || !user) return;
    try {
      if (!values.dateTime) {
        toast("Prosím zadajte dátum a čas", {
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        });
        return;
      }
      const id = crypto.randomUUID();
      const call = client.call("default", id);
      if (!call) throw new Error("can not create a call");
      const startAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.dateTime || "Instant meeting";

      await call.getOrCreate({
        data: {
          starts_at: startAt,
          custom: {
            description: description,
          },
        },
      });

      setCallDetails(call);
      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }
      toast.success("Hotovo", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    } catch (error) {
      toast.error("Nepodarilo sa zahajiť meeting", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    }
  };
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`;
  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <HomeCard
        title="Vytvoriť meeting"
        desc="Zdieľajte myšlienku medzi ostatnými"
        img="/icons/add-meeting.svg"
        className="bg-gradient-to-r from-zinc-900 to-gray-800"
        handleClick={() => setMeetingState("isInstantMeeting")}
      />
      <HomeCard
        title="Pripojiť sa na meeting"
        desc="cez pozývací odkaz"
        img="/icons/join-meeting.svg"
        className="bg-blue-1"
        handleClick={() => setMeetingState("isJoiningMeeting")}
      />
      <HomeCard
        title="Naplánovať meeting"
        desc="na rôzny deň a čas"
        img="/icons/schedule.svg"
        className="bg-purple-1"
        handleClick={() => setMeetingState("isScheduleMeeting")}
      />
      <HomeCard
        title="Nahrávky"
        desc="Nahrávky z meetingu"
        img="/icons/recordings.svg"
        className="bg-green-500"
        handleClick={() => router.push("/recordings")}
      />

      {!callDetails ? (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Naplánovať meeting"
          handleClick={createMeeting}
          className="text-center"
        >
          <div className="flex flex-col gap-2.5">
            <label
              htmlFor=""
              className="text-base text-normal leading-[22px] text-sky-2"
            >
              Pridajte popis
            </label>
            <Textarea
              className="border-none bg-zinc-800 focus-visible:ring-0 focus-visible:ring-offset-0"
              onChange={(e) => {
                setValues({ ...values, description: e.target.value });
              }}
            />
          </div>
          <div className="flex w-full gap-2.5 flex-col">
            <label
              htmlFor=""
              className="text-base text-normal leading-[22px] text-sky-2"
            >
              Vyberte dátum a čas
            </label>
            <ReactDatePicker
              locale={"sk"}
              selected={values.dateTime}
              onChange={(date) => setValues({ ...values, dateTime: date! })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="čas"
              dateFormat={"MMMM d, yyyy h:mm aa"}
              className="w-full rounded bg-zinc-800 p-2 focus:outline-none"
            />
          </div>
        </MeetingModal>
      ) : (
        <MeetingModal
          title="Meeting naplánovaný"
          className="text-center"
          image="/icons/checked.svg"
          buttonIcon="/icons/copy.svg"
          buttonText="Skopírovať pozývací odkaz na meeting"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast.success("Link je skopírovaný do schránky!", {
              style: {
                borderRadius: "10px",
                background: "#333",
                color: "#fff",
              },
            });
          }}
          onClose={() => setMeetingState(undefined)}
          isOpen={meetingState === "isScheduleMeeting"}
        ></MeetingModal>
      )}
      <MeetingModal
        isOpen={meetingState === "isJoiningMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Type the link here"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={() => router.push(values.link)}
      >
        <Input
          placeholder="Meeting link"
          onChange={(e) => setValues({ ...values, link: e.target.value })}
          className="border-none bg-zinc-800 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </MeetingModal>
      <MeetingModal
        title="Začat meeting"
        className="text-center"
        handleClick={createMeeting}
        onClose={() => setMeetingState(undefined)}
        isOpen={meetingState === "isInstantMeeting"}
      ></MeetingModal>
    </section>
  );
};

export default MeetingTypeList;
