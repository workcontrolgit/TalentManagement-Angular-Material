import { Gender } from './gender.enum';

/**
 * Employee entity
 */
export interface Employee {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  prefix?: string;
  email: string;
  phone?: string;
  employeeNumber: string;
  positionId: string;
  salary: number;
  birthday: string;
  gender: Gender;
}

/**
 * Create Employee Command
 */
export interface CreateEmployeeCommand {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  positionId: string;
  salary: number;
  birthday: string;
  email?: string;
  gender: Gender;
  employeeNumber?: string;
  prefix?: string;
  phone?: string;
}

/**
 * Update Employee Command
 */
export interface UpdateEmployeeCommand {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  positionId: string;
  salary: number;
  birthday: string;
  email?: string;
  gender: Gender;
  employeeNumber?: string;
  prefix?: string;
  phone?: string;
}
