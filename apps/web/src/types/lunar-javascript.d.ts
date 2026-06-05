declare module "lunar-javascript" {
  export const Solar: {
    fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): {
      getLunar(): {
        getEightChar(): {
          getYear(): string;
          getMonth(): string;
          getDay(): string;
          getTime(): string;
        };
        getMonth(): number;
        getDay(): number;
        getYearInChinese(): string;
        getYearInGanZhi(): string;
        getMonthInGanZhi(): string;
        getDayInGanZhi(): string;
        getTimeInGanZhi(): string;
        getYearShengXiao(): string;
        toString(): string;
      };
    };
  };
}
