
'use client';

import { useState } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Legend({ label, color }: { label: string, color: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}

export default function HROneCalendar() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const today = dayjs();

  // Example status data
  const statusData: Record<string, string[]> = {
    "2025-10-02": ["holiday"],
    "2025-10-05": ["present"],
    "2025-10-06": ["present"],
    "2025-10-07": ["present"],
    "2025-10-12": ["leave"],
    "2025-10-13": ["present"],
    "2025-10-14": ["present"],
    "2025-10-15": ["present"],
    "2025-10-17": ["present"],
    "2025-10-22": ["leave"],
    "2025-10-19": ["absent"],
  };

  const start = currentDate.startOf("month").startOf("week");
  const end = currentDate.endOf("month").endOf("week");

  const days = [];
  let day = start;
  while (day.isBefore(end, "day")) {
    days.push(day);
    day = day.add(1, "day");
  }

  const prevMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
  const nextMonth = () => setCurrentDate(currentDate.add(1, "month"));

  const getStatusDots = (date: string) => {
    const statuses = statusData[date] || [];
    return statuses.map((s, i) => (
      <span
        key={i}
        className={`w-1.5 h-1.5 rounded-full ${
          s === "present"
            ? "bg-green-500"
            : s === "leave"
            ? "bg-yellow-500"
            : s === "absent"
            ? "bg-red-500"
            : "bg-indigo-500"
        }`}
      />
    ));
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 text-sm w-full max-w-xs mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">
          Calendar
        </h3>
        <button className="text-xs text-indigo-600 font-medium hover:underline">
          Go to calendar
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={prevMonth}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
        >
          <ChevronLeft size={16} className="text-gray-600 dark:text-gray-300" />
        </button>
        <span className="font-medium text-gray-700 dark:text-gray-200">
          {currentDate.format("MMMM YYYY")}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
        >
          <ChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center text-[11px] text-gray-500 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {days.map((d, i) => {
          const dateKey = d.format("YYYY-MM-DD");
          const inCurrentMonth = d.isSame(currentDate, "month");
          const isToday = d.isSame(today, "day");

          return (
            <div
              key={i}
              className={`flex flex-col items-center justify-center py-1.5 rounded-full transition-all duration-150 ${
                isToday
                  ? "border border-indigo-500 text-indigo-600"
                  : inCurrentMonth
                  ? "text-gray-800 dark:text-gray-200"
                  : "text-gray-400 dark:text-gray-600"
              }`}
            >
              <span className="text-xs font-medium">{d.date()}</span>
              <div className="flex gap-0.5 mt-0.5">{getStatusDots(dateKey)}</div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-between mt-4 text-[11px] text-gray-500">
        <Legend label="Today" color="border border-indigo-500" />
        <Legend label="Present" color="bg-green-500" />
        <Legend label="Leave" color="bg-yellow-500" />
        <Legend label="Absent" color="bg-red-500" />
        <Legend label="Holiday" color="bg-indigo-500" />
      </div>
    </div>
  );
}
