export default class STATE {
    // error code
    static readonly UNKNOWN_ERROR = 1001;

    static readonly FILE_TYPE_ERROR = 2001;
    static readonly FILE_ID_ERROR = 2002;
    static readonly FILE_SIG_ERROR = 2003;
    static readonly FILE_NEXT_ERROR = 2004;
    static readonly FILE_DATE_ERROR = 2005;
    static readonly FILE_LENGTH_ERROR = 2006;

    static readonly PROFILE_SIG_ERROR = 3001;

    static readonly ITEMS_SIG_ERROR = 4001;
    static readonly ITEMS_ID_ERROR = 4002;
    static readonly ITEMS_LENGTH_ERROR = 4003;
    static readonly ITEMS_DATE_ERROR = 4004;
    static readonly ITEMS_UPSTREAM_ERROR = 4005;

    static readonly DELETE_NOT_FOUND_ERROR = 5001;
    static readonly DELETE_DATE_ERROR = 5002;

    static readonly GET_NOT_FOUND_ERROR = 6001;

    // 错误提示信息
    static readonly ERROR_MESSAGES = {
        1001: 'Unknown error',

        2001: 'File type error',
        2002: 'File id error',
        2003: 'File signature error',
        2004: 'File items_next error',
        2005: 'File date error',
        2006: 'File value length error',
        2007: 'File not found',

        3001: 'Profile signature error',

        4001: 'Items signature error',
        4002: 'Items id error',
        4003: 'Items length error',
        4004: 'Items date error',
        4005: 'Items upstream error',

        5001: 'Persona not found error',
        5002: 'Date mismatch error',

        6001: 'Persona not found error',
    };
}
