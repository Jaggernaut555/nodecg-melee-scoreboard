// This type is a JSON field so we need to implement it ourself

export declare type ConnectedAccounts = {
  slippi: SlippiAccount;
};

declare type SlippiAccount = {
  value: string;
};

export declare type ConnectCodeIDs = {
  code: string;
  id: string;
  displayName: string;
};
