import { Machine } from 'xstate';

const toggleMachine = Machine({
    id: 'login',
    initial: 'logout',
});