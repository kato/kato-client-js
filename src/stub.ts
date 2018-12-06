export type Parameter = {
  name: string,
  type: string
}
export type Method = {
  name: string,
  parameters: Parameter[]
}
export type Module = {
  name: string,
  methods: Method[]
}
export type Stub = {
  modules: Module[]
}
