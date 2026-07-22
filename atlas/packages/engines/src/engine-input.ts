export interface EngineInput {
  birthDate?: string;
  birthTime?: string;
  birthLat?: number;
  birthLng?: number;
  timezone?: string;
  seed?: string;
  timestamp?: string;
  gender?: "male" | "female";
  sittingDegree?: number;
  sittingMountain?: string;
  birthYear?: number;
  lines?: number[];
  questionCategory?: "career" | "love" | "finance" | "health" | "general";
  spread?: "three" | "five" | "nine";
  temple?: "guanyin" | "guandi" | "mazu" | "mixed";
  question?: string;
  juMethod?: "chaibu" | "zhirun";
  spreadId?: string;
  tarotScenario?: "关系" | "事业" | "财务" | "心理" | "通用";
  qimenQuestionType?: string;
  predictionWindow?: "时" | "日" | "旬" | "月";
}
