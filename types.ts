export interface Data {
  centers: Center[];
}

export interface Center {
  center_id: number;
  name: string;
  state_name: StateName;
  district_name: DistrictName;
  block_name: BlockName;
  pincode: number;
  lat: number;
  long: number;
  from: string;
  to: string;
  fee_type: FeeType;
  sessions: Session[];
}

export enum BlockName {
  CentralDelhi = "Central Delhi",
  NotApplicable = "Not Applicable",
}

export enum DistrictName {
  CentralDelhi = "Central Delhi",
  NewDelhi = "New Delhi",
}

export enum FeeType {
  Free = "Free",
  PAID = "Paid",
}

export interface Session {
  session_id: string;
  available_capacity: number;
  min_age_limit: number;
  vaccine: string;
  date: string;
}

export enum StateName {
  Delhi = "Delhi",
}
