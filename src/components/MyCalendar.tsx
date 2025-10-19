
'use client';

import { useState } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MyCalendar() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const startOfMonth = currentDate.startOf("month").startOf("week");
  const endOfMonth = currentDate.endOf("month").endOf("week");

  const days = [];
  let day = startOfMonth;
  while (day.isBefore(endOfMonth, "day")) {
    days.push(day);
    day = day.add(1, "day");
  }

  const prevMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
  const nextMonth = () => setCurrentDate(currentDate.add(1, "month"));

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
          <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
        </button>
        <h2 className="font-semibold text-lg text-zinc-800 dark:text-zinc-100">
          {currentDate.format("MMMM YYYY")}
        </h2>
        <button onClick={nextMonth} className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
          <ChevronRight className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-xs text-center text-zinc-500 uppercase mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((dayItem, i) => {
          const isToday = dayItem.isSame(dayjs(), "day");
          const isSelected = dayItem.isSame(selectedDate, "day");
          const isCurrentMonth = dayItem.isSame(currentDate, "month");

          return (
            <button
              key={i}
              onClick={() => setSelectedDate(dayItem)}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center text-sm transition-all duration-150",
                isSelected ? "bg-indigo-500 text-white font-semibold" :
                isToday ? "border border-indigo-500 text-indigo-500 font-medium" :
                isCurrentMonth ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-400 dark:text-zinc-600",
                "hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
              )}
            >
              {dayItem.date()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
