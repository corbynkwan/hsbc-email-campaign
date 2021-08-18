function compareTableFormattedDate(dateA, dateB) {
    let dmyA = dateA.split("/");
    let dmyB = dateB.split("/");
    let dateObjA = new Date(dmyA[2], dmyA[1], dmyA[0]);
    let dateObjB = new Date(dmyB[2], dmyB[1], dmyB[0]); 
    return dateObjA - dateObjB;                     
}

export {compareTableFormattedDate}