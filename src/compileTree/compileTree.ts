import path from 'path'
import { createFile } from '../'
import { getList, DependencyHeader, getDeprecatedHeader } from '../sasjsCli'

export interface Leaf {
  content: string
  dependencies: string[]
  location: string
}

export interface Tree {
  [key: string]: Leaf
}

export class CompileTree {
  private _tree: Tree
  private _treePath: string

  constructor(treePath: string, tree: Tree = {}) {
    this._treePath = treePath
    this._tree = tree
  }

  get tree() {
    return this._tree
  }

  public getLeaf(location: string) {
    return this._tree[this.getFileName(location)]
  }

  public addLeaf(leaf: Leaf) {
    leaf.dependencies = getList(
      getDeprecatedHeader(leaf.content, DependencyHeader.Macro),
      leaf.content
    )
    leaf.content = removeHeader(leaf.content)

    this._tree[this.getFileName(leaf.location)] = leaf

    return leaf
  }

  public async saveTree() {
    await createFile(this._treePath, JSON.stringify(this._tree, null, 2))
  }

  private getFileName(location: string) {
    return location.split(path.sep)[location.split(path.sep).length - 1]
  }
}

export const removeHeader = (content: string) =>
  content.replace(new RegExp(`^\\/\\*[\\s\\S]*\\*\\/\\n\\n`), '')
