export default class STATE {
    // error code
    static readonly UNKNOWN_ERROR = 1001;
    static readonly FILE_TYPE_ERROR = 2001;
    static readonly FILE_ID_ERROR = 2002;

    // 错误提示信息
    static readonly ERROR_MESSAGES = {
        1001: 'Unknown error',

        2001: 'File type error',
        2002: 'File id error',
    };
}
