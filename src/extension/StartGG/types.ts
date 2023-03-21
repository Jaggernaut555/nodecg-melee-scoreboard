// This type is a JSON field so we need to implement it ourself

export declare type ConnectedAccounts = {
  slippi: SlippiAccount;
};

declare type SlippiAccount = {
  value: string;
};

export declare type ConnectCodeID = {
  code: string;
  id: string;
  displayName: string;
};

export declare type SetInfo = {
  id: string;
  roundInfo: string;
  bestOf: number;
};
