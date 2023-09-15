({
  onWillParseMarkdown: async function(markdown) {
    // 标点挤压
    // left-punct: [：；、。，．！？]
    // opening-punct: [｛〔〈《「『【〘〖〝‘“｟«（]
    // closing-punct: [｝〕〉》」』】〙〗’”｠»）]
    markdown = markdown.replace(/((([：；、。，．！？｝〕〉》」』】〙〗’”｠»）])(?=[：；、。，．！？｛〔〈《「『【〘〖〝‘“｟«（｝〕〉》」』】〙〗’”｠»）]))+)/g, (whole, content) => "<span class=\"full-width-punct\">" + content + "</span>");
    markdown = markdown.replace(/((([｛〔〈《「『【〘〖〝‘“｟«（])(?=[｛〔〈《「『【〘〖〝‘“｟«（]))+)/g, (whole, content) => "<span class=\"full-width-punct\">" + content + "</span>");
    
    // 内联代码着色
    markdown = markdown.replace(
      /`([^`\n]+)`/g,
      (_,code) => {
        code = code.replace(
          /\b(typedef|explicit|extern|auto|static|thread_local|const|volatile|public|decltype|consteval|constexpr|operator|bool|false|true|char|short|int|long|unsigned|signed|enum|struct|float|double)\b/g,
          (a,b)=>"<span class=\"token keyword\">"+b+"</span>");
        code = code.replace(
          /\b(if|else|goto|while|do|for|return|switch|case|break)\b/g,
          (a,b)=>"<span class=\"token keyword control\">"+b+"</span>");
          code = code.replace(
            /\b(\d+)\b/g,
            (a,b)=>"<span class=\"token number\">"+b+"</span>");
        return "<code>"+code+"</code>";
      })
    return markdown;
  },

  onDidParseMarkdown: async function(html) {
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