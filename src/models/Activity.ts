export interface ActivityDetails {
  feedType?: 'breast' | 'bottle';
  diaperType?: 'wet' | 'soiled' | 'both';
  [key: string]: string | undefined;
}

export class Activity {
  constructor({
    id = null,
    type, // 'feed', 'diaper', 'sleep', 'growth'
    startTime,
    endTime = null,
    details = {},
    notes = '',
    babyId,
    userId,
  }: {
    id?: string | null;
    type: string;
    startTime: Date;
    endTime?: Date | null;
    details?: ActivityDetails;
    notes?: string;
    babyId: string;
    userId: string;
  }) {
    this.id = id;
    this.type = type;
    this.startTime = startTime;
    this.endTime = endTime;
    this.details = details;
    this.notes = notes;
    this.babyId = babyId;
    this.userId = userId;
  }

  id: string | null;
  type: string;
  startTime: Date;
  endTime: Date | null;
  details: ActivityDetails;
  notes: string;
  babyId: string;
  userId: string;

  toJSON() {
    return {
      type: this.type,
      startTime: this.startTime,
      endTime: this.endTime,
      details: this.details,
      notes: this.notes,
      babyId: this.babyId,
      userId: this.userId,
    };
  }

  static fromJSON(json: any, id: string): Activity {
    return new Activity({
      id,
      ...json,
      startTime: json.startTime.toDate(),
      endTime: json.endTime?.toDate() || null,
    });
  }
} 