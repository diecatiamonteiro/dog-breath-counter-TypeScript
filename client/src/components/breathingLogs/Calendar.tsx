import { MdAccessTime } from "react-icons/md";
import { FaRegCalendar, FaRegComment } from "react-icons/fa";
import { TbLungsFilled } from "react-icons/tb";
import {
  processLogsForCalendar,
  groupLogsByDate,
} from "@/utils/breathingLogUtils";

import { BreathingLog } from "@/types/BreathingLogTypes";

type Props = {
  logs: BreathingLog[]; // Raw breathing logs
};

export default function Calendar({ logs }: Props) {
  // Process and group logs using shared utilities
  const processedData = processLogsForCalendar(logs);
  const dateGroups = groupLogsByDate(processedData);

  const logsPerDate = Object.keys(dateGroups).map((date) => (
    <div key={date}>
      <div className="flex items-center gap-2 mt-8 font-bold text-accent">
        <FaRegCalendar /> <p>{date}</p>
      </div>

      {/* <p>
        Highest BPM:{" "}
        {dateGroups[date].reduce((max, log) => Math.max(max, log.bpm), 0)} BPM
      </p> */}

      <p>
        Lowest:{" "}
        {dateGroups[date].reduce(
          (min, log) => Math.min(min, log.bpm),
          Infinity
        )}{" "}
        BPM
      </p>

      {dateGroups[date].map((log) => (
        <div key={log.id}>
          <div className="flex items-center gap-2 mt-4">
            <MdAccessTime />
            <p>{log.time}</p>
          </div>
          <div className="flex items-center gap-2">
            <TbLungsFilled />
            <p>{log.bpm} BPM</p>
          </div>
          {log.comment && (
            <div className="flex items-center gap-2">
              <FaRegComment />
              <p>{log.comment}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  ));

  return <div>{logsPerDate}</div>;
}
