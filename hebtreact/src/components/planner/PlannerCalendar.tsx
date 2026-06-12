import { useState, useMemo, useCallback, forwardRef, useImperativeHandle} from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import CustomButton from "../ui/CustomButton.tsx";
import type { MealPlan } from "@/model/data-model.ts";
import PlannerDayCard from "./PlannerDayCard.tsx";
import {getStartOfWeek} from "@/model/constants.ts";

interface PlannerCalendarProps {
    mealPlans: MealPlan[];
    onMealsUpdated?: () => void;
    readOnly?: boolean;
}

export interface PlannerCalendarRef {
    navigateToDate: (date: Date) => void;
}

const PlannerCalendar = forwardRef<PlannerCalendarRef, PlannerCalendarProps>(
    ({ mealPlans, onMealsUpdated, readOnly = false }, ref) => { // <-- ESTRATTO readOnly
        const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getStartOfWeek(new Date()));

        useImperativeHandle(ref, () => ({
            navigateToDate: (date: Date) => {
                setCurrentWeekStart(getStartOfWeek(date));
            }
        }));

        const handlePrevWeek = useCallback(() => {
            setCurrentWeekStart(prev => {
                const next = new Date(prev);
                next.setDate(prev.getDate() - 7);
                return next;
            });
        }, []);

        const handleNextWeek = useCallback(() => {
            setCurrentWeekStart(prev => {
                const next = new Date(prev);
                next.setDate(prev.getDate() + 7);
                return next;
            });
        }, []);

        const handleToday = useCallback(() => {
            setCurrentWeekStart(getStartOfWeek(new Date()));
        }, []);

        const weekDays = useMemo(() => {
            const days: Date[] = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date(currentWeekStart);
                d.setDate(currentWeekStart.getDate() + i);
                days.push(d);
            }
            return days;
        }, [currentWeekStart]);

        const mealsByDay = useMemo(() => {
            const map = new Map<string, MealPlan[]>();

            weekDays.forEach(day => {
                map.set(day.toISOString().split('T')[0], []);
            });

            mealPlans.forEach(plan => {
                const planDateStr = plan.plannedDate;
                if (map.has(planDateStr)) {
                    map.get(planDateStr)?.push(plan);
                }
            });
            return map;
        }, [mealPlans, weekDays]);

        const monthYearString = currentWeekStart.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

        return (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between bg-background/50 border border-border/50 p-4 rounded-xl">
                    <h3 className="text-xl font-bold text-foreground capitalize">
                        {monthYearString}
                    </h3>
                    <div className="flex items-center gap-2">
                        <CustomButton variant="outline" onClick={handleToday} className="hidden md:flex h-10">
                            Oggi
                        </CustomButton>
                        <div className="flex items-center gap-1 border border-border/50 rounded-lg p-1">
                            <CustomButton variant="ghost" onClick={handlePrevWeek} className="h-8 w-8 p-0 rounded-md">
                                <FiChevronLeft className="w-5 h-5" />
                            </CustomButton>
                            <CustomButton variant="ghost" onClick={handleNextWeek} className="h-8 w-8 p-0 rounded-md">
                                <FiChevronRight className="w-5 h-5" />
                            </CustomButton>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                    {weekDays.map((day) => {
                        const dateStr = day.toISOString().split('T')[0];
                        const dailyMeals = mealsByDay.get(dateStr) || [];

                        return (
                            <PlannerDayCard
                                key={dateStr}
                                date={day}
                                meals={dailyMeals}
                                onMealsUpdated={onMealsUpdated || (() => {})}
                                readOnly={readOnly}
                            />
                        );
                    })}
                </div>
            </div>
        );
    });

PlannerCalendar.displayName = "PlannerCalendar";
export default PlannerCalendar;