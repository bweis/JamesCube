/**
 * Created by Ben on 11/29/16.
 */

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.io.FileReader;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

public class Parser {
    @SuppressWarnings("unchecked")
    public static void main(String[] args) throws IOException {

        File[] files = new File("/Users/Ben/Desktop/assets/games/Fibbage/content/questions").listFiles();
        List<File> jetFiles = new ArrayList<File>();

        int qCount = 0;
        for (qCount = 0; qCount < files.length; qCount++) {
            if (files[qCount].isDirectory()) {
                File[] questionFiles = files[qCount].listFiles();
                for (File f : questionFiles) {
                    if (f.getName().equals("data.jet"))
                        jetFiles.add(f);
                }
            }
        }

        JSONObject finalJSON = new JSONObject();

        // Parse files
        JSONParser parser = new JSONParser();
        for (int i = 0; i < jetFiles.size(); i++) {
            try {
                JSONObject tempObj = new JSONObject();
                Object obj = parser.parse(new FileReader(jetFiles.get(i)));

                JSONObject jsonObject = (JSONObject) obj;
                JSONArray array = (JSONArray) jsonObject.get("fields");

                JSONObject suggestionsObj = (JSONObject) array.get(2);
                JSONObject categoryObj = (JSONObject) array.get(3);
                JSONObject answerObj = (JSONObject) array.get(4);
                JSONObject alternateSpellingObj = (JSONObject) array.get(6);
                JSONObject questionObj = (JSONObject) array.get(7);

                String category = (String) categoryObj.get("v");
                String question = (String) questionObj.get("v");
                String answer = (String) answerObj.get("v");

                String[] altSpellingString = ((String)(alternateSpellingObj.get("v"))).split(",");
                JSONArray alternateSpelling = addStringArrToJsonArr(altSpellingString);

                String[] suggestionsString = ((String)(suggestionsObj.get("v"))).split(",");
                JSONArray suggestions = addStringArrToJsonArr(suggestionsString);

                tempObj.put("category", category);
                tempObj.put("question", question);
                tempObj.put("answer", answer);
                tempObj.put("alternate_spellings", alternateSpelling);
                tempObj.put("suggestions", suggestions);
                finalJSON.put(i, tempObj);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        FileWriter file = new FileWriter("/Users/Ben/Desktop/questions.json");
        try {
            file.write(finalJSON.toJSONString());
            file.close();  //to flush the rest of the buffer
            System.out.println("Successfully Copied JSON Object to File...");
            System.out.println(finalJSON.toJSONString());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static JSONArray addStringArrToJsonArr(String[] arr) {
        JSONArray json = new JSONArray();
        for (String str : arr) {
            if (str.length() != 0)
                json.add(str);
        }
        return json;
    }


}
