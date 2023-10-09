({
  onWillParseMarkdown: async function(markdown) {
    return markdown;
  },

  onDidParseMarkdown: async function(html) {
    // 标点挤压
    // left-punct: [：；、。，．！？]
    // opening-punct: [｛〔〈《「『【〘〖〝‘“｟«（]
    // closing-punct: [｝〕〉》」』】〙〗’”｠»）]
    html = html.replace(/((([：；、。，．！？｝〕〉》」』】〙〗’”｠»）])(?=[：；、。，．！？｛〔〈《「『【〘〖〝‘“｟«（｝〕〉》」』】〙〗’”｠»）]))+)/g, (whole, content) => "<span class=\"full-width-punct\">" + content + "</span>");
    html = html.replace(/((([｛〔〈《「『【〘〖〝‘“｟«（])(?=[｛〔〈《「『【〘〖〝‘“｟«（]))+)/g, (whole, content) => "<span class=\"full-width-punct\">" + content + "</span>");
    
    // 内联代码着色
    html = html.replace(
      /<code>(.+?)<\/code>/g,
      (_,code) => {
        code = code.replace(
          /\b(typename|nullptr|requires|this|template|void|static_cast|using|typedef|explicit|extern|auto|static|thread_local|const|volatile|public|decltype|consteval|constexpr|operator|bool|false|true|char|short|int|long|unsigned|signed|enum|struct|float|double)\b/g,
          (a,b)=>"<span class=\"token keyword\">"+b+"</span>");
        code = code.replace(
          /\b(co_return|if|else|goto|while|do|for|return|switch|case|break|throw)\b/g,
          (a,b)=>"<span class=\"token keyword control\">"+b+"</span>");
          code = code.replace(
            /\b(\d+)\b/g,
            (a,b)=>"<span class=\"token number\">"+b+"</span>");
        return "<code>"+code+"</code>";
      });
    return html;
  },
  
  onWillTransformMarkdown: async function(markdown) {
    return markdown;
  },
  
  onDidTransformMarkdown: async function(markdown) {
    return markdown;
  },

  processWikiLink: function({text, link}) {
    return { 
      text,  
      link: link ? link : text.endsWith('.md') ? text : `${text}.md`,
    };
  }
})