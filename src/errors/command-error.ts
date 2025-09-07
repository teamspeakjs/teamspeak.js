import { RawCommandError } from '../typings/teamspeak';

export class CommandError extends Error {
  id: number;
  raw: RawCommandError;

  constructor(name: string, error: RawCommandError) {
    super(`Error executing command "${name}": ${error.msg}`);
    this.id = Number(error.id);
    this.raw = error;
  }
}
