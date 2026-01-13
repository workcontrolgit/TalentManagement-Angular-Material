/**
 * Position entity
 */
export interface Position {
  id: string;
  positionTitle: string;
  positionNumber: string;
  positionDescription?: string;
  departmentId: string;
  salaryRangeId: string;
}

/**
 * Create Position Command
 */
export interface CreatePositionCommand {
  positionTitle?: string;
  positionNumber?: string;
  positionDescription?: string;
  departmentId: string;
  salaryRangeId: string;
}

/**
 * Update Position Command
 */
export interface UpdatePositionCommand {
  id: string;
  positionTitle?: string;
  positionNumber?: string;
  positionDescription?: string;
  departmentId: string;
  salaryRangeId: string;
}

/**
 * Insert Mock Position Command
 */
export interface InsertMockPositionCommand {
  rowCount: number;
}
