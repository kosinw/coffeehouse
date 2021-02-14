export default function getGridLayout(num = 1) {
    switch (num) {
        case 1: return '"A"';
        case 2: return '"B A"';
        case 3: return '"B A" "C C"';
        case 4: return '"B A" "D C"';
        case 5: return '"E B A" "D D C"';
        case 6: return '"E B A" "F D C"';
        case 7: return '"G E B A" "F D D C"';
        case 8: return '"G E B A" "H F D C"';
        default: throw new Error("Cannot have more than 8 people");
    }
}

export function getNumRows(num = 1) {
    if (num < 3) {
        return 1;
    }

    return 2;
}

export function getNumColumns(num = 1) { 
    switch (num) {
        case 1: return 1;
        case 2: return 2;
        case 3: return 2;
        case 4: return 2;
        case 5: return 3;
        case 6: return 3;
        case 7: return 4;
        case 8: return 4;
        default: throw new Error("Cannot have more than 8 people");
    }
}