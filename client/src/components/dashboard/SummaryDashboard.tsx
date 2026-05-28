import { useState } from "react";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLockedInStore } from "@/store/useLockedInStore";
import { cn } from "@/lib/utils";

export function SummaryDashboard() {
  const [weekOffset, setWeekOffset] = useState(0);
  
  const tasks = useLockedInStore((state) => state.tasks);
  const placements = useLockedInStore((state) => state.placements);
  
  const upcomingTestsCount = placements.filter(
    (p) => p.oaTestDate && new Date(p.oaTestDate) >= new Date()
  ).length;

  // Mini Calendar Calculations
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const monthName = today.toLocaleString("en", { month: "long" });
  
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const calendarDays: Array<Date | null> = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    calendarDays.push(new Date(currentYear, currentMonth, d));
  }

  // Weekly Analytics Calculations
  const getWeekDays = (offset: number) => {
    const startOfWeek = new Date(today);
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    startOfWeek.setDate(today.getDate() - distanceToMonday + (offset * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays(weekOffset);
  const weekStartStr = weekDays[0].toLocaleDateString("en", { month: "short", day: "numeric" });
  const weekEndStr = weekDays[6].toLocaleDateString("en", { month: "short", day: "numeric" });
  
  const chartData = weekDays.map((date) => {
    const dayTasks = tasks.filter(
      (t) => new Date(t.dueDate).toDateString() === date.toDateString()
    );
    const completed = dayTasks.filter((t) => t.completed).length;
    const percentage = dayTasks.length ? Math.round((completed / dayTasks.length) * 100) : 0;
    
    return {
      date,
      dayName: date.toLocaleDateString("en", { weekday: "short" }).slice(0, 1),
      percentage,
      taskCount: dayTasks.length,
      completedCount: completed
    };
  });

  const activeTab = useLockedInStore((state) => state.activeTab);
  const isPlacementTracker = activeTab === "placement-tracker";

  return (
    <section className="mb-6">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-[220px_1fr_1fr]">
        
        {/* Column 1: Upcoming Tests (Square) */}
        <Card className="h-[220px] w-full md:w-[220px] shrink-0 flex flex-col justify-between p-4 bg-white/[0.02] border-white/8 hover:bg-white/[0.04] transition-all duration-300">
          <div className="flex items-center justify-between h-8">
            <span className="text-sm font-bold text-muted-foreground">Upcoming Tests</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <CalendarClock className="h-4 w-4" />
            </div>
          </div>
          <div className="my-auto">
            <p className="text-5xl font-black text-foreground tracking-tight">{upcomingTestsCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              {upcomingTestsCount === 1 ? "1 active assessment" : `${upcomingTestsCount} active assessments`}.
            </p>
          </div>
        </Card>

        {isPlacementTracker ? (
          /* Landscape motivational image spanning 2 columns */
          <Card className="h-[220px] col-span-1 md:col-span-2 relative flex items-center justify-center overflow-hidden rounded-2xl bg-black border border-white/8 hover:bg-black/90 transition-all duration-300">
            <img 
              src="/quote.png" 
              alt="Motivation: The day you plant the seed is not the day you eat the fruit." 
              className="w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity duration-300"
            />
          </Card>
        ) : (
          <>
            {/* Column 2: Mini Calendar */}
            <Card className="h-[220px] p-4 flex flex-col bg-white/[0.02] border-white/8 justify-between">
              <div className="flex items-center justify-between h-8 mb-0.5">
                <span className="text-sm font-bold text-muted-foreground capitalize">{monthName} {currentYear}</span>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground uppercase mb-0.5">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div key={i} className="py-0.5">{d}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-y-0.5 gap-x-1 text-center text-xs flex-1 items-center">
                {calendarDays.map((date, idx) => {
                  if (!date) return <div key={idx} className="h-6" />;
                  const isDayToday = date.toDateString() === today.toDateString();
                  const dayNum = date.getDate();
                  
                  const dayTasks = tasks.filter(
                    (t) => new Date(t.dueDate).toDateString() === date.toDateString()
                  );
                  
                  const hasTasks = dayTasks.length > 0;
                  const hasTests = placements.some(
                    (p) => p.oaTestDate && new Date(p.oaTestDate).toDateString() === date.toDateString()
                  );
                  
                  return (
                    <div 
                      key={idx} 
                      className="relative h-6 flex flex-col items-center justify-center rounded-md transition hover:bg-white/5 cursor-default group"
                    >
                      {/* Task List Dialog Tooltip */}
                      {hasTasks && (
                        <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-30 pointer-events-none transition-all duration-150">
                          <div className="bg-black/95 backdrop-blur-md border border-white/10 text-white rounded-lg p-2.5 shadow-2xl min-w-[130px] max-w-[170px]">
                            <p className="font-bold border-b border-white/10 pb-1 mb-1.5 text-[11px] uppercase tracking-wider text-primary">Scheduled Tasks</p>
                            <ul className="space-y-1 text-left">
                              {dayTasks.slice(0, 4).map((t) => (
                                <li 
                                  key={t.id} 
                                  className={cn(
                                    "truncate text-[11px] list-disc list-inside",
                                    t.completed ? "text-emerald-400 font-medium" : "text-white"
                                  )}
                                >
                                  {t.title}
                                </li>
                              ))}
                              {dayTasks.length > 4 && (
                                <li className="text-[10px] text-muted-foreground italic pl-2">
                                  + {dayTasks.length - 4} more tasks
                                </li>
                              )}
                            </ul>
                          </div>
                          <div className="w-1.5 h-1.5 bg-black/95 rotate-45 border-r border-b border-white/10 -mt-1" />
                        </div>
                      )}

                      <span className={cn(
                        "flex h-5 w-5 items-center justify-center text-xs font-semibold rounded-full",
                        isDayToday 
                          ? "bg-primary text-primary-foreground shadow-[0_0_8px_rgba(255,255,255,0.1)] font-bold" 
                          : hasTasks
                            ? "text-primary font-bold"
                            : "text-foreground/80"
                      )}>
                        {dayNum}
                      </span>
                      
                      <div className="absolute bottom-0 flex gap-0.5 items-center justify-center">
                        {hasTests && <span className="h-0.5 w-0.5 rounded-full bg-red-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Column 3: Weekly Analytics */}
            <Card className="h-[220px] p-4 flex flex-col bg-white/[0.02] border-white/8 justify-between">
              <div className="flex items-center justify-between h-8 mb-2">
                <div className="flex flex-col justify-center">
                  <span className="text-sm font-bold text-muted-foreground">Weekly Analytics</span>
                  <span className="text-xs text-muted-foreground font-medium leading-none mt-1">{weekStartStr} - {weekEndStr}</span>
                </div>
                
                <div className="flex gap-1">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-6 w-6 rounded-md p-0" 
                    onClick={() => setWeekOffset((prev) => prev - 1)}
                    aria-label="Previous week"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-6 w-6 rounded-md p-0" 
                    onClick={() => setWeekOffset((prev) => prev + 1)}
                    aria-label="Next week"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-1 flex-1 pt-2 pb-1">
                {chartData.map((item, idx) => {
                  const isDayToday = item.date.toDateString() === today.toDateString();
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-7 hidden group-hover:flex flex-col items-center z-10 transition-all duration-150">
                        <div className="bg-black/90 border border-white/10 text-[10px] text-white rounded-md px-1.5 py-0.5 shadow-xl whitespace-nowrap">
                          {item.percentage}% ({item.completedCount}/{item.taskCount} tasks)
                        </div>
                        <div className="w-1 h-1 bg-black/90 rotate-45 border-r border-b border-white/10 -mt-0.5" />
                      </div>
                      
                      {/* Circle Track */}
                      <div className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center relative my-2">
                        <div 
                          className={cn(
                            "rounded-full transition-all duration-500 ease-out origin-center",
                            isDayToday ? "bg-primary shadow-[0_0_12px_rgba(255,255,255,0.15)]" : "bg-primary/50"
                          )}
                          style={{ 
                            width: `${Math.max(6, item.percentage * 0.36)}px`, 
                            height: `${Math.max(6, item.percentage * 0.36)}px` 
                          }}
                        />
                      </div>
                      
                      {/* Day label */}
                      <span className={cn(
                        "text-xs font-semibold mt-1",
                        isDayToday ? "text-primary font-bold" : "text-muted-foreground/80"
                      )}>
                        {item.dayName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}

      </div>
    </section>
  );
}