export class TransformationCommand {
    removedColumn: number;
    numericOnly: number;
}

export class RemoveColumnCommand extends TransformationCommand {
    constructor(i) {
        super()
        this.removedColumn = i
    }
}

export class MakeNumericOnlyCommand extends TransformationCommand {
    constructor(i) {
        super()
        this.numericOnly = i
    }
}