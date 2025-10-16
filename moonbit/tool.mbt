///|
pub fn parse(source : String, mode : String) -> String {
  @basic.show_loc.protect(Json, () => match mode {
    "lexer" => {
      let { tokens, errors, docstrings } = @lexer.tokens_from_string(
        source,
        comment=true,
      )
      let tokens = Json::array(
        tokens.map(fn(triple) -> Json {
          let (token, start, end) = triple
          {
            "token": Json::string(token.to_string()),
            "loc": @basic.Location::{ start, end },
          }
        }),
      )
      let json : Json = {
        "type": "Token",
        "tokens": tokens,
        "errors": Json::array(errors.map(x => Json::string(x.to_string()))),
      }
      json.stringify(indent=2)
    }
    _ => {
      let parser = if mode == "handparser" {
        @parser.Handrolled
      } else {
        MoonYacc
      }
      let (impls, reports) = @parser.parse_string(source, parser~)
      let json : Json = {
        "type": "Program",
        "body": Json::array(impls.map(ToJson::to_json).to_array()),
        "diagnostics": reports,
      }
      json.stringify(indent=2)
    }
  })
}
