function safeJSONParse(string){
    try {
        return [true, JSON.parse(string)];
    } catch {
        return [false, null]
    }
}

export default safeJSONParse;